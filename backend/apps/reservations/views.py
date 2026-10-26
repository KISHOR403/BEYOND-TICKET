"""
Views for reservations app.
Manages inventory holds, pricing snapshots, and expiration.
"""

from datetime import timedelta
from decimal import Decimal
from django.conf import settings
from django.db import transaction
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.inventory.models import InventoryPool, SeatInventory, TicketType
from apps.listings.models import Listing, Session
from .models import Reservation, ReservationItem
from .serializers import (
    ReservationCreateSerializer,
    ReservationSerializer,
)


class ReservationViewSet(viewsets.ModelViewSet):
    """Handles reservation holds and lifecycle."""

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ReservationSerializer
    http_method_names = ["get", "post", "delete"]

    def get_queryset(self):
        # Auto-expire held reservations past expiration time
        now = timezone.now()
        expired_reservations = Reservation.objects.filter(
            user=self.request.user,
            status=Reservation.Status.HELD,
            expires_at__lt=now,
        )
        for res in expired_reservations:
            self._release_reservation(res, Reservation.Status.EXPIRED)

        return (
            Reservation.objects.filter(user=self.request.user)
            .select_related("listing", "session")
            .prefetch_related("items__ticket_type", "items__seat")
        )

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = ReservationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        idempotency_key = data.get("idempotency_key")
        if idempotency_key:
            existing = Reservation.objects.filter(
                idempotency_key=idempotency_key,
                user=request.user,
            ).first()
            if existing:
                if existing.status == Reservation.Status.HELD and not existing.is_expired:
                    return Response(
                        ReservationSerializer(existing).data,
                        status=status.HTTP_200_OK,
                    )

        listing = Listing.objects.filter(id=data["listing_id"]).first()
        if not listing:
            return Response(
                {"detail": "Listing not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        session = None
        if data.get("session_id"):
            session = Session.objects.filter(
                id=data["session_id"], listing=listing
            ).first()
            if not session:
                return Response(
                    {"detail": "Selected session not found for this listing."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        items_data = data.get("items", [])
        if not items_data:
            return Response(
                {"detail": "At least one ticket must be selected."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        hold_minutes = getattr(settings, "RESERVATION_HOLD_MINUTES", 10)
        expires_at = timezone.now() + timedelta(minutes=hold_minutes)

        subtotal = Decimal("0.00")
        created_items = []

        # Lock and validate inventory
        for item_data in items_data:
            ticket_type = (
                TicketType.objects.select_for_update()
                .filter(id=item_data["ticket_type_id"], listing=listing, is_active=True)
                .first()
            )
            if not ticket_type:
                return Response(
                    {"detail": f"Ticket type {item_data['ticket_type_id']} not found or unavailable."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            quantity = item_data.get("quantity", 1)
            seat_id = item_data.get("seat_id")

            if seat_id:
                # Reserved seating
                seat = (
                    SeatInventory.objects.select_for_update()
                    .filter(id=seat_id, ticket_type=ticket_type)
                    .first()
                )
                if not seat:
                    return Response(
                        {"detail": "Selected seat not found."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                # Check if available or expired hold
                is_available = seat.status == SeatInventory.SeatStatus.AVAILABLE or (
                    seat.status == SeatInventory.SeatStatus.HELD
                    and seat.held_until
                    and seat.held_until < timezone.now()
                )
                if not is_available:
                    return Response(
                        {"detail": f"Seat {seat.seat_number} is no longer available."},
                        status=status.HTTP_409_CONFLICT,
                    )

                seat.status = SeatInventory.SeatStatus.HELD
                seat.held_until = expires_at
                seat.held_by = request.user
                seat.save(update_fields=["status", "held_until", "held_by"])

                unit_price = seat.effective_price
                line_total = unit_price * quantity
                subtotal += line_total
                created_items.append({
                    "ticket_type": ticket_type,
                    "seat": seat,
                    "quantity": quantity,
                    "unit_price": unit_price,
                    "total_price": line_total,
                })
            else:
                # General admission pool
                pool = (
                    InventoryPool.objects.select_for_update()
                    .filter(ticket_type=ticket_type)
                    .first()
                )
                if pool:
                    if pool.available < quantity:
                        return Response(
                            {"detail": f"Only {max(0, pool.available)} tickets remaining for {ticket_type.name}."},
                            status=status.HTTP_409_CONFLICT,
                        )
                    pool.reserved_count += quantity
                    pool.save(update_fields=["reserved_count"])

                unit_price = ticket_type.price
                line_total = unit_price * quantity
                subtotal += line_total
                created_items.append({
                    "ticket_type": ticket_type,
                    "seat": None,
                    "quantity": quantity,
                    "unit_price": unit_price,
                    "total_price": line_total,
                })

        # Calculate fees and tax transparently
        fee_rate = Decimal(str(getattr(settings, "PLATFORM_FEE_PERCENT", "5.00"))) / Decimal("100")
        platform_fee = (subtotal * fee_rate).quantize(Decimal("0.01"))
        tax = (platform_fee * Decimal("0.18")).quantize(Decimal("0.01"))  # 18% GST on platform fee
        total = subtotal + platform_fee + tax

        reservation = Reservation.objects.create(
            user=request.user,
            listing=listing,
            session=session,
            status=Reservation.Status.HELD,
            expires_at=expires_at,
            idempotency_key=idempotency_key,
            subtotal=subtotal,
            platform_fee=platform_fee,
            tax=tax,
            total=total,
            currency=listing.currency,
        )

        for ci in created_items:
            ReservationItem.objects.create(
                reservation=reservation,
                ticket_type=ci["ticket_type"],
                seat=ci["seat"],
                quantity=ci["quantity"],
                unit_price=ci["unit_price"],
                total_price=ci["total_price"],
            )

        return Response(
            ReservationSerializer(reservation).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"])
    def release(self, request, pk=None):
        """Manually release a held reservation."""
        reservation = self.get_object()
        if reservation.status != Reservation.Status.HELD:
            return Response(
                {"detail": "Only held reservations can be released."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        self._release_reservation(reservation, Reservation.Status.RELEASED)
        return Response({"status": "released", "id": str(reservation.id)})

    @staticmethod
    def _release_reservation(reservation, target_status):
        """Release reservation holds back to inventory pool / seats."""
        with transaction.atomic():
            for item in reservation.items.select_related("ticket_type", "seat"):
                if item.seat:
                    item.seat.status = SeatInventory.SeatStatus.AVAILABLE
                    item.seat.held_until = None
                    item.seat.held_by = None
                    item.seat.save(update_fields=["status", "held_until", "held_by"])
                else:
                    pool = InventoryPool.objects.filter(ticket_type=item.ticket_type).first()
                    if pool:
                        pool.reserved_count = max(0, pool.reserved_count - item.quantity)
                        pool.save(update_fields=["reserved_count"])
            reservation.status = target_status
            reservation.save(update_fields=["status"])
