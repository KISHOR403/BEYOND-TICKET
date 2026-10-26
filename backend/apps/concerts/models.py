"""
Concert and live event specific models.
"""

import uuid

from django.db import models


class ConcertDetail(models.Model):
    """Extended details for concert/live event listings."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    listing = models.OneToOneField(
        "listings.Listing", on_delete=models.CASCADE, related_name="concert_detail"
    )
    genre = models.CharField(max_length=100, blank=True, default="")
    artists = models.JSONField(default=list, blank=True, help_text="List of performing artists")
    has_reserved_seating = models.BooleanField(default=False)
    doors_open_before_minutes = models.PositiveIntegerField(default=60)

    class Meta:
        db_table = "concert_details"

    def __str__(self):
        return f"Concert: {self.listing.title}"
