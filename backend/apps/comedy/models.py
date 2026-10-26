"""
Comedy & theatre specific models.
"""

import uuid

from django.db import models


class ComedyDetail(models.Model):
    """Extended details for comedy/theatre listings."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    listing = models.OneToOneField(
        "listings.Listing", on_delete=models.CASCADE, related_name="comedy_detail"
    )
    performers = models.JSONField(default=list, blank=True)
    show_type = models.CharField(max_length=50, blank=True, default="", help_text="standup, play, musical, etc.")
    duration_minutes = models.PositiveIntegerField(null=True, blank=True)
    has_intermission = models.BooleanField(default=False)
    has_reserved_seating = models.BooleanField(default=False)
    content_warning = models.TextField(blank=True, default="")

    class Meta:
        db_table = "comedy_details"

    def __str__(self):
        return f"Comedy/Theatre: {self.listing.title}"
