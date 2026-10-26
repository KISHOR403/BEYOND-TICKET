"""
Reservation models — temporary holds and the reservation lifecycle.
AVAILABLE → HELD → CONFIRMED (or EXPIRED/RELEASED)
"""

import uuid

from django.conf import settings
from django.db import models
from django.utils import timezone


class Reservation(models.Model):
    """A temporary hold on inventory items before payment."""

    class Status(models.TextChoices):
        HELD = "held", "Held"
        CONFIRMED = "confirmed", "Confirmed"
        EXPIRED = "expired", "Expired"
        RELEASED = "released", "Released"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reservations"
    )
    listing = models.ForeignKey(
        "listings.Listing", on_delete=models.CASCADE, related_name="reservations"
    )
    session = models.ForeignKey(
        "listings.Session", on_delete=models.CASCADE, null=True, blank=True,
        related_name="reservations",
    )
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.HELD)
    expires_at = models.DateTimeField()
    idempotency_key = models.CharField(max_length=100, unique=True, blank=True, null=True)

    # Price snapshot at reservation time
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    platform_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default="INR")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "reservations"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "status"]),
            models.Index(fields=["expires_at"]),
        ]

    def __str__(self):
        return f"Reservation {self.id} ({self.status})"

    @property
    def is_expired(self):
        return self.status == self.Status.HELD and self.expires_at < timezone.now()


class ReservationItem(models.Model):
    """Individual items within a reservation."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reservation = models.ForeignKey(
        Reservation, on_delete=models.CASCADE, related_name="items"
    )
    ticket_type = models.ForeignKey(
        "inventory.TicketType", on_delete=models.PROTECT, related_name="reservation_items"
    )
    seat = models.ForeignKey(
        "inventory.SeatInventory", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="reservation_items",
    )
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        db_table = "reservation_items"

    def __str__(self):
        return f"{self.ticket_type.name} x{self.quantity}"
