"""
Issued ticket and validation/scan models.
"""

import secrets
import uuid

from django.conf import settings
from django.db import models


def generate_ticket_token():
    """Generate a cryptographically secure ticket token."""
    return secrets.token_urlsafe(32)


class IssuedTicket(models.Model):
    """A unique digital ticket issued after confirmed payment."""

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        USED = "used", "Used"
        CANCELLED = "cancelled", "Cancelled"
        EXPIRED = "expired", "Expired"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey("orders.Order", on_delete=models.CASCADE, related_name="tickets")
    order_item = models.ForeignKey(
        "orders.OrderItem", on_delete=models.CASCADE, null=True, blank=True, related_name="tickets"
    )
    ticket_type = models.ForeignKey(
        "inventory.TicketType", on_delete=models.PROTECT, related_name="issued_tickets"
    )
    seat = models.ForeignKey(
        "inventory.SeatInventory", on_delete=models.SET_NULL, null=True, blank=True,
    )
    attendee = models.ForeignKey(
        "orders.Attendee", on_delete=models.SET_NULL, null=True, blank=True,
    )

    # Secure token for QR code — NOT the primary key
    token = models.CharField(max_length=64, unique=True, default=generate_ticket_token)
    reference = models.CharField(max_length=20, unique=True)

    status = models.CharField(max_length=12, choices=Status.choices, default=Status.ACTIVE)
    qr_code = models.ImageField(upload_to="tickets/qr/", blank=True, null=True)

    # Event snapshot (immutable after issuance)
    event_title = models.CharField(max_length=300)
    event_date = models.DateTimeField(null=True, blank=True)
    venue_name = models.CharField(max_length=200, blank=True, default="")
    seat_info = models.CharField(max_length=100, blank=True, default="")

    issued_at = models.DateTimeField(auto_now_add=True)
    used_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "issued_tickets"
        indexes = [
            models.Index(fields=["token"]),
            models.Index(fields=["reference"]),
            models.Index(fields=["order", "status"]),
        ]

    def __str__(self):
        return f"Ticket {self.reference} ({self.status})"

    def save(self, *args, **kwargs):
        if not self.reference:
            from django.utils.crypto import get_random_string
            self.reference = f"TK-{get_random_string(8, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')}"
        super().save(*args, **kwargs)


class TicketScan(models.Model):
    """Audit trail for ticket scans/check-ins."""

    class Result(models.TextChoices):
        VALID = "valid", "Valid"
        ALREADY_USED = "already_used", "Already Used"
        INVALID = "invalid", "Invalid"
        EXPIRED = "expired", "Expired"
        CANCELLED = "cancelled", "Cancelled"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ticket = models.ForeignKey(IssuedTicket, on_delete=models.CASCADE, related_name="scans")
    scanned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="ticket_scans"
    )
    result = models.CharField(max_length=20, choices=Result.choices)
    scanned_at = models.DateTimeField(auto_now_add=True)
    location = models.CharField(max_length=200, blank=True, default="")
    device_info = models.CharField(max_length=200, blank=True, default="")

    class Meta:
        db_table = "ticket_scans"
        ordering = ["-scanned_at"]

    def __str__(self):
        return f"Scan {self.ticket.reference}: {self.result}"
