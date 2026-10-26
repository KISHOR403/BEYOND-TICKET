"""
Cultural & local event specific models.
"""

import uuid

from django.db import models


class CulturalDetail(models.Model):
    """Extended details for cultural and local events."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    listing = models.OneToOneField(
        "listings.Listing", on_delete=models.CASCADE, related_name="cultural_detail"
    )
    event_type = models.CharField(max_length=100, blank=True, default="", help_text="festival, fair, exhibition, etc.")
    is_multi_day = models.BooleanField(default=False)
    has_day_passes = models.BooleanField(default=False)
    has_multi_day_pass = models.BooleanField(default=False)
    food_available = models.BooleanField(default=False)
    parking_available = models.BooleanField(default=False)

    class Meta:
        db_table = "cultural_details"

    def __str__(self):
        return f"Cultural: {self.listing.title}"
