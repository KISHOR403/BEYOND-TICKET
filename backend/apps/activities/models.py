"""
Activities & attractions specific models.
"""

import uuid

from django.db import models


class ActivityDetail(models.Model):
    """Extended details for activities and attractions."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    listing = models.OneToOneField(
        "listings.Listing", on_delete=models.CASCADE, related_name="activity_detail"
    )
    activity_type = models.CharField(max_length=100, blank=True, default="")
    duration_minutes = models.PositiveIntegerField(null=True, blank=True)
    includes = models.JSONField(default=list, blank=True, help_text="What's included")
    requirements = models.TextField(blank=True, default="", help_text="Physical requirements, gear, etc.")
    has_family_bundle = models.BooleanField(default=False)
    max_group_size = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        db_table = "activity_details"

    def __str__(self):
        return f"Activity: {self.listing.title}"


class ActivitySlot(models.Model):
    """Time slots for activities with capacity limits."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(
        "listings.Session", on_delete=models.CASCADE, related_name="activity_slots"
    )
    slot_time = models.DateTimeField()
    capacity = models.PositiveIntegerField()
    booked_count = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "activity_slots"
        ordering = ["slot_time"]

    def __str__(self):
        return f"Slot {self.slot_time} ({self.capacity - self.booked_count} left)"

    @property
    def available(self):
        return self.capacity - self.booked_count
