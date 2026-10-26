"""
Bus ticket specific models. Buses use external inventory adapters.
"""

import uuid

from django.db import models


class BusOperator(models.Model):
    """A bus operator/transport company."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True)
    logo = models.ImageField(upload_to="bus_operators/", blank=True, null=True)
    rating = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    amenities = models.JSONField(default=list, blank=True, help_text="AC, WiFi, charging, etc.")
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "bus_operators"

    def __str__(self):
        return self.name


class Route(models.Model):
    """A bus route between two cities."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    origin_city = models.CharField(max_length=100)
    destination_city = models.CharField(max_length=100)
    distance_km = models.PositiveIntegerField(null=True, blank=True)
    estimated_duration_minutes = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        db_table = "bus_routes"
        unique_together = ("origin_city", "destination_city")

    def __str__(self):
        return f"{self.origin_city} → {self.destination_city}"


class BusTrip(models.Model):
    """A specific bus trip/service on a route."""

    class BusType(models.TextChoices):
        SEATER = "seater", "Seater"
        SLEEPER = "sleeper", "Sleeper"
        SEMI_SLEEPER = "semi_sleeper", "Semi Sleeper"
        AC_SEATER = "ac_seater", "AC Seater"
        AC_SLEEPER = "ac_sleeper", "AC Sleeper"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    operator = models.ForeignKey(BusOperator, on_delete=models.CASCADE, related_name="trips")
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name="trips")
    listing = models.ForeignKey(
        "listings.Listing", on_delete=models.CASCADE, null=True, blank=True,
        related_name="bus_trips",
    )
    bus_type = models.CharField(max_length=20, choices=BusType.choices, default=BusType.SEATER)
    departure_time = models.DateTimeField()
    arrival_time = models.DateTimeField()
    total_seats = models.PositiveIntegerField()
    available_seats = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default="INR")
    amenities = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    # Seat layout for visual selection
    seat_layout = models.JSONField(
        default=dict, blank=True,
        help_text="JSON representing the bus seat layout grid",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "bus_trips"
        ordering = ["departure_time"]
        indexes = [
            models.Index(fields=["route", "departure_time"]),
        ]

    def __str__(self):
        return f"{self.operator.name}: {self.route} @ {self.departure_time}"


class BoardingPoint(models.Model):
    """Boarding point for a bus trip."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    trip = models.ForeignKey(BusTrip, on_delete=models.CASCADE, related_name="boarding_points")
    name = models.CharField(max_length=200)
    address = models.TextField(blank=True, default="")
    time = models.TimeField()
    landmark = models.CharField(max_length=200, blank=True, default="")

    class Meta:
        db_table = "boarding_points"

    def __str__(self):
        return self.name


class DropoffPoint(models.Model):
    """Drop-off point for a bus trip."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    trip = models.ForeignKey(BusTrip, on_delete=models.CASCADE, related_name="dropoff_points")
    name = models.CharField(max_length=200)
    address = models.TextField(blank=True, default="")
    time = models.TimeField()

    class Meta:
        db_table = "dropoff_points"

    def __str__(self):
        return self.name
