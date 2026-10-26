"""
Audit log model.
"""

import uuid

from django.conf import settings
from django.db import models


class AuditLog(models.Model):
    """Platform-wide audit trail for important actions."""

    class Action(models.TextChoices):
        CREATE = "create", "Create"
        UPDATE = "update", "Update"
        DELETE = "delete", "Delete"
        LOGIN = "login", "Login"
        PAYMENT = "payment", "Payment"
        REFUND = "refund", "Refund"
        CHECKIN = "checkin", "Check-in"
        STATUS_CHANGE = "status_change", "Status Change"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="audit_logs",
    )
    action = models.CharField(max_length=20, choices=Action.choices)
    resource_type = models.CharField(max_length=50)
    resource_id = models.CharField(max_length=100)
    description = models.TextField(blank=True, default="")
    changes = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "audit_logs"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["resource_type", "resource_id"]),
            models.Index(fields=["user", "action"]),
            models.Index(fields=["-created_at"]),
        ]

    def __str__(self):
        return f"{self.action} on {self.resource_type} by {self.user}"
