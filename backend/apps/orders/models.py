"""
Order models — confirmed bookings after successful payment.
"""

import uuid

from django.conf import settings
from django.db import models


class Order(models.Model):
    """A confirmed booking/order."""

    class Status(models.TextChoices):
        PENDING = "pending", "Pending Payment"
        CONFIRMED = "confirmed", "Confirmed"
        CANCELLED = "cancelled", "Cancelled"
        REFUNDED = "refunded", "Refunded"
        PARTIALLY_REFUNDED = "partially_refunded", "Partially Refunded"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_number = models.CharField(max_length=20, unique=True, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="orders"
    )
    reservation = models.OneToOneField(
        "reservations.Reservation", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="order",
    )
    listing = models.ForeignKey(
        "listings.Listing", on_delete=models.PROTECT, related_name="orders"
    )
    session = models.ForeignKey(
        "listings.Session", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="orders",
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)

    # Immutable price snapshot
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    platform_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default="INR")

    # Contact info snapshot
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=20, blank=True, default="")

    notes = models.TextField(blank=True, default="")
    cancellation_reason = models.TextField(blank=True, default="")
    cancelled_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "orders"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "status"]),
            models.Index(fields=["order_number"]),
        ]

    def __str__(self):
        return f"Order {self.order_number}"

    def save(self, *args, **kwargs):
        if not self.order_number:
            from django.utils.crypto import get_random_string
            self.order_number = f"BT-{get_random_string(10, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')}"
        super().save(*args, **kwargs)


class OrderItem(models.Model):
    """Individual items within an order."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    ticket_type = models.ForeignKey(
        "inventory.TicketType", on_delete=models.PROTECT, related_name="order_items"
    )
    seat = models.ForeignKey(
        "inventory.SeatInventory", on_delete=models.SET_NULL, null=True, blank=True,
    )
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        db_table = "order_items"

    def __str__(self):
        return f"{self.ticket_type.name} x{self.quantity}"


class Attendee(models.Model):
    """Attendee/passenger information for an order item."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="attendees")
    order_item = models.ForeignKey(
        OrderItem, on_delete=models.CASCADE, null=True, blank=True, related_name="attendees"
    )
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100, blank=True, default="")
    email = models.EmailField(blank=True, default="")
    phone = models.CharField(max_length=20, blank=True, default="")
    age = models.PositiveIntegerField(null=True, blank=True)
    gender = models.CharField(max_length=20, blank=True, default="")

    class Meta:
        db_table = "attendees"

    def __str__(self):
        return f"{self.first_name} {self.last_name}"
