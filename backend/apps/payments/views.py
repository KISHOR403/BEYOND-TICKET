"""
Views for payments app.
Implements real Razorpay flow + sandbox adapter for development.
"""

import hmac
import hashlib
from decimal import Decimal
import razorpay
from django.conf import settings
from django.db import transaction
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.audit.models import AuditLog
from apps.inventory.models import InventoryPool, SeatInventory
from apps.orders.models import Order
from apps.reservations.models import Reservation
from apps.tickets.services import issue_tickets_for_order
from .models import Payment, Refund, WebhookEvent
from .serializers import (
    PaymentIntentSerializer,
    PaymentSerializer,
    PaymentVerifySerializer,
    RefundSerializer,
)


class PaymentViewSet(viewsets.GenericViewSet):
    """Payment processing endpoints."""

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PaymentSerializer

    @action(detail=False, methods=["post"], url_path="create-intent")
    def create_intent(self, request):
        """Create a payment intent / order for Razorpay or Sandbox."""
        serializer = PaymentIntentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        order = Order.objects.filter(id=data["order_id"], user=request.user).first()
        if not order:
            return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        if order.status != Order.Status.PENDING:
            return Response(
                {"detail": f"Order is not pending payment (status: {order.status})."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        provider = data["provider"]
        has_razorpay_keys = bool(settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET)

        amount_in_paise = int(order.total * 100)
        provider_order_id = ""

        if provider == Payment.Provider.RAZORPAY and has_razorpay_keys:
            client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
            razorpay_order = client.order.create({
                "amount": amount_in_paise,
                "currency": order.currency,
                "receipt": order.order_number,
                "notes": {
                    "order_id": str(order.id),
                    "listing": order.listing.title,
                },
            })
            provider_order_id = razorpay_order["id"]
        else:
            provider = Payment.Provider.SANDBOX
            import uuid
            provider_order_id = f"order_sbx_{uuid.uuid4().hex[:14]}"

        payment = Payment.objects.create(
            order=order,
            provider=provider,
            status=Payment.Status.INITIATED,
            amount=order.total,
            currency=order.currency,
            provider_order_id=provider_order_id,
            idempotency_key=data.get("idempotency_key"),
        )

        return Response({
            "payment_id": str(payment.id),
            "provider": provider,
            "provider_order_id": provider_order_id,
            "amount": float(order.total),
            "currency": order.currency,
            "razorpay_key_id": settings.RAZORPAY_KEY_ID if has_razorpay_keys else "rzp_test_demo",
            "order_number": order.order_number,
        })

    @action(detail=False, methods=["post"])
    def verify(self, request):
        """Verify payment signature and complete the order & ticket issuance."""
        serializer = PaymentVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        order = Order.objects.filter(id=data["order_id"], user=request.user).first()
        if not order:
            return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        payment = Payment.objects.filter(order=order).order_by("-created_at").first()
        if not payment:
            return Response({"detail": "No payment record found for this order."}, status=status.HTTP_404_NOT_FOUND)

        if payment.status == Payment.Status.CAPTURED and order.status == Order.Status.CONFIRMED:
            return Response({
                "success": True,
                "order_number": order.order_number,
                "payment_id": str(payment.id),
                "status": "already_confirmed",
            })

        provider_order_id = data.get("provider_order_id") or payment.provider_order_id
        provider_payment_id = data.get("provider_payment_id") or f"pay_sbx_{order.order_number}"
        provider_signature = data.get("provider_signature", "")

        is_sandbox = data.get("is_sandbox") or payment.provider == Payment.Provider.SANDBOX or not settings.RAZORPAY_KEY_SECRET

        if not is_sandbox:
            client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
            try:
                client.utility.verify_payment_signature({
                    "razorpay_order_id": provider_order_id,
                    "razorpay_payment_id": provider_payment_id,
                    "razorpay_signature": provider_signature,
                })
            except razorpay.errors.SignatureVerificationError:
                payment.status = Payment.Status.FAILED
                payment.failure_reason = "Signature verification failed"
                payment.save(update_fields=["status", "failure_reason"])
                return Response(
                    {"detail": "Payment signature verification failed."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # Atomic order confirmation & inventory deduction & ticket issuance
        with transaction.atomic():
            payment.status = Payment.Status.CAPTURED
            payment.provider_payment_id = provider_payment_id
            payment.provider_signature = provider_signature
            payment.save(update_fields=["status", "provider_payment_id", "provider_signature"])

            order.status = Order.Status.CONFIRMED
            order.save(update_fields=["status"])

            if order.reservation:
                order.reservation.status = Reservation.Status.CONFIRMED
                order.reservation.save(update_fields=["status"])

            # Deduct inventory & mark seats sold
            for item in order.items.select_related("ticket_type", "seat"):
                if item.seat:
                    item.seat.status = SeatInventory.SeatStatus.SOLD
                    item.seat.held_until = None
                    item.seat.held_by = None
                    item.seat.save(update_fields=["status", "held_until", "held_by"])
                else:
                    pool = getattr(item.ticket_type, "inventory_pool", None)
                    if pool:
                        pool.reserved_count = max(0, pool.reserved_count - item.quantity)
                        pool.sold_count += item.quantity
                        pool.save(update_fields=["reserved_count", "sold_count"])

            # Issue digital tickets with QR codes
            tickets = issue_tickets_for_order(order)

            # Audit log
            AuditLog.objects.create(
                user=request.user,
                action=AuditLog.Action.PAYMENT,
                resource_type="Order",
                resource_id=str(order.id),
                description=f"Payment captured for {order.order_number}",
                changes={
                    "order_number": order.order_number,
                    "amount": str(order.total),
                    "tickets_issued": len(tickets),
                    "provider": payment.provider,
                },
            )

        return Response({
            "success": True,
            "order_number": order.order_number,
            "payment_id": str(payment.id),
            "tickets_issued": len(tickets),
            "status": "confirmed",
        })

    @action(detail=False, methods=["post"], permission_classes=[permissions.AllowAny], url_path="webhook")
    def webhook(self, request):
        """Receive and deduplicate payment provider webhook events."""
        event_id = request.headers.get("X-Razorpay-Event-Id", "")
        signature = request.headers.get("X-Razorpay-Signature", "")

        if not event_id:
            import uuid
            event_id = f"evt_{uuid.uuid4().hex}"

        # Deduplication check
        existing = WebhookEvent.objects.filter(event_id=event_id).first()
        if existing:
            return Response({"status": "already_processed"}, status=status.HTTP_200_OK)

        webhook_event = WebhookEvent.objects.create(
            provider="razorpay",
            event_id=event_id,
            event_type=request.data.get("event", "unknown"),
            payload=request.data,
            processed=True,
            processed_at=timezone.now(),
        )

        return Response({"status": "received", "id": str(webhook_event.id)})
