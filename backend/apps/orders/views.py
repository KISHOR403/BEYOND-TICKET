"""
Views for orders app.
"""

from django.db import transaction
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.reservations.models import Reservation
from .models import Attendee, Order, OrderItem
from .serializers import (
    OrderCreateSerializer,
    OrderDetailSerializer,
)


class OrderViewSet(viewsets.ModelViewSet):
    """Manages customer orders."""

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderDetailSerializer
    http_method_names = ["get", "post"]

    def get_queryset(self):
        return (
            Order.objects.filter(user=self.request.user)
            .select_related("listing", "listing__venue", "session", "reservation")
            .prefetch_related("items__ticket_type", "items__seat", "attendees")
        )

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        reservation = (
            Reservation.objects.select_for_update()
            .filter(id=data["reservation_id"], user=request.user)
            .first()
        )
        if not reservation:
            return Response(
                {"detail": "Reservation not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if reservation.status != Reservation.Status.HELD or reservation.is_expired:
            return Response(
                {"detail": "This reservation has expired or is no longer valid."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if order already exists for this reservation
        existing_order = getattr(reservation, "order", None)
        if existing_order and existing_order.status == Order.Status.PENDING:
            return Response(
                OrderDetailSerializer(existing_order).data,
                status=status.HTTP_200_OK,
            )

        order = Order.objects.create(
            user=request.user,
            reservation=reservation,
            listing=reservation.listing,
            session=reservation.session,
            status=Order.Status.PENDING,
            subtotal=reservation.subtotal,
            platform_fee=reservation.platform_fee,
            tax=reservation.tax,
            total=reservation.total,
            currency=reservation.currency,
            contact_email=data["contact_email"],
            contact_phone=data.get("contact_phone", ""),
            notes=data.get("notes", ""),
        )

        # Copy items
        res_items = reservation.items.select_related("ticket_type", "seat").all()
        created_order_items = []
        for r_item in res_items:
            o_item = OrderItem.objects.create(
                order=order,
                ticket_type=r_item.ticket_type,
                seat=r_item.seat,
                quantity=r_item.quantity,
                unit_price=r_item.unit_price,
                total_price=r_item.total_price,
            )
            created_order_items.append(o_item)

        # Create attendees if provided
        attendees_data = data.get("attendees", [])
        for att_data in attendees_data:
            Attendee.objects.create(
                order=order,
                order_item=created_order_items[0] if created_order_items else None,
                first_name=att_data.get("first_name", ""),
                last_name=att_data.get("last_name", ""),
                email=att_data.get("email", ""),
                phone=att_data.get("phone", ""),
                age=att_data.get("age"),
                gender=att_data.get("gender", ""),
            )

        return Response(
            OrderDetailSerializer(order).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        """Cancel an order before or after confirmation according to policy."""
        order = self.get_object()
        if order.status in [Order.Status.CANCELLED, Order.Status.REFUNDED]:
            return Response(
                {"detail": "Order is already cancelled or refunded."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        reason = request.data.get("reason", "Cancelled by customer")
        with transaction.atomic():
            order.status = Order.Status.CANCELLED
            order.cancellation_reason = reason
            order.cancelled_at = timezone.now()
            order.save(update_fields=["status", "cancellation_reason", "cancelled_at"])

            # Cancel issued tickets
            order.tickets.update(status="cancelled")

            # Release inventory if was confirmed
            for item in order.items.select_related("seat", "ticket_type"):
                if item.seat:
                    item.seat.status = "available"
                    item.seat.held_until = None
                    item.seat.held_by = None
                    item.seat.save(update_fields=["status", "held_until", "held_by"])
                else:
                    pool = getattr(item.ticket_type, "inventory_pool", None)
                    if pool:
                        pool.sold_count = max(0, pool.sold_count - item.quantity)
                        pool.save(update_fields=["sold_count"])

        return Response(OrderDetailSerializer(order).data)
