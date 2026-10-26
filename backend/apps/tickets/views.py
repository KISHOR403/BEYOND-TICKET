"""
Views for tickets app.
Handles digital tickets, QR code access, and staff ticket scanning / validation.
"""

from django.db import transaction
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import IssuedTicket, TicketScan
from .serializers import (
    IssuedTicketSerializer,
    TicketValidateSerializer,
)


class TicketViewSet(viewsets.ReadOnlyModelViewSet):
    """Customer tickets and verification."""

    serializer_class = IssuedTicketSerializer
    lookup_field = "token"

    def get_permissions(self):
        # Verification and validation can be public / staff
        if self.action in ["retrieve", "validate"]:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return IssuedTicket.objects.none()
        return (
            IssuedTicket.objects.filter(order__user=user)
            .select_related("order", "ticket_type", "seat", "attendee")
            .prefetch_related("scans")
            .order_by("-issued_at")
        )

    def retrieve(self, request, *args, **kwargs):
        """Retrieve a ticket by its secure token or reference."""
        token_or_ref = kwargs.get("token")
        ticket = (
            IssuedTicket.objects.filter(token=token_or_ref).first()
            or IssuedTicket.objects.filter(reference=token_or_ref).first()
        )
        if not ticket:
            return Response({"detail": "Ticket not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = IssuedTicketSerializer(ticket, context={"request": request})
        return Response(serializer.data)

    @action(detail=False, methods=["post"], permission_classes=[permissions.AllowAny])
    def validate(self, request):
        """
        Validate and check in a ticket token scanned from QR code.
        Can be used by organizers, gate staff, or scanner devices.
        """
        serializer = TicketValidateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token_str = serializer.validated_data["token"].strip()
        location = serializer.validated_data.get("location", "")
        device_info = serializer.validated_data.get("device_info", "")

        # Clean token prefix if QR code included "BT-VERIFY:"
        if token_str.startswith("BT-VERIFY:"):
            token_str = token_str.replace("BT-VERIFY:", "").strip()

        ticket = (
            IssuedTicket.objects.select_related("order", "ticket_type", "seat")
            .filter(token=token_str)
            .first()
            or IssuedTicket.objects.select_related("order", "ticket_type", "seat")
            .filter(reference=token_str)
            .first()
        )

        if not ticket:
            return Response(
                {
                    "valid": False,
                    "result": TicketScan.Result.INVALID,
                    "message": "Invalid ticket token. Ticket does not exist.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        scanned_by = request.user if request.user.is_authenticated else None

        if ticket.status == IssuedTicket.Status.USED:
            scan = TicketScan.objects.create(
                ticket=ticket,
                scanned_by=scanned_by,
                result=TicketScan.Result.ALREADY_USED,
                location=location,
                device_info=device_info,
            )
            return Response(
                {
                    "valid": False,
                    "result": TicketScan.Result.ALREADY_USED,
                    "message": f"Ticket was already scanned on {ticket.used_at.strftime('%Y-%m-%d %H:%M') if ticket.used_at else 'earlier'}.",
                    "ticket": IssuedTicketSerializer(ticket, context={"request": request}).data,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if ticket.status == IssuedTicket.Status.CANCELLED:
            TicketScan.objects.create(
                ticket=ticket,
                scanned_by=scanned_by,
                result=TicketScan.Result.CANCELLED,
                location=location,
                device_info=device_info,
            )
            return Response(
                {
                    "valid": False,
                    "result": TicketScan.Result.CANCELLED,
                    "message": "This ticket has been cancelled and cannot be used for entry.",
                    "ticket": IssuedTicketSerializer(ticket, context={"request": request}).data,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Ticket is valid and active -> Check-in!
        with transaction.atomic():
            ticket.status = IssuedTicket.Status.USED
            ticket.used_at = timezone.now()
            ticket.save(update_fields=["status", "used_at"])

            scan = TicketScan.objects.create(
                ticket=ticket,
                scanned_by=scanned_by,
                result=TicketScan.Result.VALID,
                location=location,
                device_info=device_info,
            )

        return Response(
            {
                "valid": True,
                "result": TicketScan.Result.VALID,
                "message": "Success! Ticket verified and checked in.",
                "ticket": IssuedTicketSerializer(ticket, context={"request": request}).data,
            },
            status=status.HTTP_200_OK,
        )
