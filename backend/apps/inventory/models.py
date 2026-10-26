"""
Inventory models: TicketType, InventoryPool, SeatInventory.
Manages capacity and seat-level availability for all categories.
"""

import uuid

from django.db import models


class TicketType(models.Model):
    """A type of ticket available for a listing (e.g., VIP, Standard, Early Bird)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    listing = models.ForeignKey(
        "listings.Listing", on_delete=models.CASCADE, related_name="ticket_types"
    )
    session = models.ForeignKey(
        "listings.Session", on_delete=models.CASCADE, null=True, blank=True,
        related_name="ticket_types", help_text="If null, applies to all sessions",
    )
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, default="")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default="INR")
    max_per_order = models.PositiveIntegerField(default=10)
    sort_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    sale_start = models.DateTimeField(blank=True, null=True)
    sale_end = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "ticket_types"
        ordering = ["sort_order", "price"]
        indexes = [
            models.Index(fields=["listing", "is_active"]),
        ]

    def __str__(self):
        return f"{self.name} — ₹{self.price}"


class InventoryPool(models.Model):
    """
    General admission inventory pool for a ticket type.
    Uses atomic DB operations to prevent overselling.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ticket_type = models.OneToOneField(
        TicketType, on_delete=models.CASCADE, related_name="inventory_pool"
    )
    total_capacity = models.PositiveIntegerField()
    reserved_count = models.PositiveIntegerField(default=0)
    sold_count = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "inventory_pools"

    def __str__(self):
        return f"{self.ticket_type.name}: {self.available} available"

    @property
    def available(self):
        return self.total_capacity - self.reserved_count - self.sold_count

    @property
    def is_sold_out(self):
        return self.available <= 0


class SeatInventory(models.Model):
    """
    Individual seat tracking for reserved-seating events.
    Uses unique constraints to prevent double-booking.
    """

    class SeatStatus(models.TextChoices):
        AVAILABLE = "available", "Available"
        HELD = "held", "Held"
        SOLD = "sold", "Sold"
        BLOCKED = "blocked", "Blocked"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ticket_type = models.ForeignKey(
        TicketType, on_delete=models.CASCADE, related_name="seats"
    )
    session = models.ForeignKey(
        "listings.Session", on_delete=models.CASCADE, related_name="seats"
    )
    section = models.CharField(max_length=50, blank=True, default="")
    row = models.CharField(max_length=10, blank=True, default="")
    seat_number = models.CharField(max_length=10)
    status = models.CharField(
        max_length=10, choices=SeatStatus.choices, default=SeatStatus.AVAILABLE
    )
    price_override = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text="Override price for this specific seat",
    )
    held_until = models.DateTimeField(null=True, blank=True)
    held_by = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="held_seats",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "seat_inventory"
        # Prevent duplicate seat assignments for the same session
        constraints = [
            models.UniqueConstraint(
                fields=["session", "section", "row", "seat_number"],
                name="unique_seat_per_session",
            ),
        ]
        indexes = [
            models.Index(fields=["session", "status"]),
        ]

    def __str__(self):
        label = f"{self.section}-{self.row}-{self.seat_number}" if self.section else self.seat_number
        return f"Seat {label} ({self.status})"

    @property
    def effective_price(self):
        return self.price_override if self.price_override is not None else self.ticket_type.price
