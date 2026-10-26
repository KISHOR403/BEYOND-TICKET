"""
Notification model.
"""

import uuid

from django.conf import settings
from django.db import models


class Notification(models.Model):
    """User notifications."""

    class Channel(models.TextChoices):
        EMAIL = "email", "Email"
        SMS = "sms", "SMS"
        PUSH = "push", "Push"
        IN_APP = "in_app", "In-App"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        SENT = "sent", "Sent"
        FAILED = "failed", "Failed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications"
    )
    channel = models.CharField(max_length=10, choices=Channel.choices, default=Channel.IN_APP)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    title = models.CharField(max_length=200)
    message = models.TextField()
    read = models.BooleanField(default=False)
    data = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "notifications"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "read"]),
        ]

    def __str__(self):
        return f"{self.title} → {self.user.email}"
