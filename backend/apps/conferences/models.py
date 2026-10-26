"""
Conference and workshop specific models.
"""

import uuid

from django.db import models


class ConferenceDetail(models.Model):
    """Extended details for a conference listing."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    listing = models.OneToOneField(
        "listings.Listing", on_delete=models.CASCADE, related_name="conference_detail"
    )
    conference_type = models.CharField(max_length=100, blank=True, default="")
    topics = models.JSONField(default=list, blank=True)
    speakers = models.JSONField(default=list, blank=True, help_text="List of speaker objects")
    has_workshops = models.BooleanField(default=False)
    has_networking = models.BooleanField(default=False)
    certificate_provided = models.BooleanField(default=False)

    class Meta:
        db_table = "conference_details"

    def __str__(self):
        return f"Conference: {self.listing.title}"


class ConferenceAgenda(models.Model):
    """Agenda/schedule item for a conference."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conference = models.ForeignKey(
        ConferenceDetail, on_delete=models.CASCADE, related_name="agenda_items"
    )
    title = models.CharField(max_length=300)
    description = models.TextField(blank=True, default="")
    speaker = models.CharField(max_length=200, blank=True, default="")
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    room = models.CharField(max_length=100, blank=True, default="")
    sort_order = models.IntegerField(default=0)

    class Meta:
        db_table = "conference_agenda"
        ordering = ["start_time", "sort_order"]

    def __str__(self):
        return self.title


class WorkshopSession(models.Model):
    """An optional workshop within a conference."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conference = models.ForeignKey(
        ConferenceDetail, on_delete=models.CASCADE, related_name="workshops"
    )
    title = models.CharField(max_length=300)
    description = models.TextField(blank=True, default="")
    instructor = models.CharField(max_length=200, blank=True, default="")
    capacity = models.PositiveIntegerField(default=30)
    enrolled_count = models.PositiveIntegerField(default=0)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    room = models.CharField(max_length=100, blank=True, default="")
    additional_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        db_table = "workshop_sessions"
        ordering = ["start_time"]

    def __str__(self):
        return self.title

    @property
    def available_spots(self):
        return self.capacity - self.enrolled_count
