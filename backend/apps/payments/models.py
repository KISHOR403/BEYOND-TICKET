"""
Payment and refund models.
"""

import uuid

from django.conf import settings
from django.db import models


class Payment(models.Model):
    """A payment attempt for an order."""

    class Status(models.TextChoices):
        INITIATED = "initiated", "Initiated"
        PENDING = "pending", "Pending"
        AUTHORIZED = "authorized", "Authorized"
        CAPTURED = "captured", "Captured"
        FAILED = "failed", "Failed"
        REFUNDED = "refunded", "Refunded"

    class Provider(models.TextChoices):
        RAZORPAY = "razorpay", "Razorpay"
        SANDBOX = "sandbox", "Sandbox"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey("orders.Order", on_delete=models.CASCADE, related_name="payments")
    provider = models.CharField(max_length=20, choices=Provider.choices, default=Provider.RAZORPAY)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.INITIATED)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default="INR")

    # Provider-specific IDs
    provider_order_id = models.CharField(max_length=200, blank=True, default="")
    provider_payment_id = models.CharField(max_length=200, blank=True, default="")
    provider_signature = models.CharField(max_length=500, blank=True, default="")

    idempotency_key = models.CharField(max_length=100, unique=True, blank=True, null=True)
    attempts = models.PositiveIntegerField(default=0)
    failure_reason = models.TextField(blank=True, default="")
    metadata = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "payments"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["order", "status"]),
            models.Index(fields=["provider_order_id"]),
            models.Index(fields=["provider_payment_id"]),
        ]

    def __str__(self):
        return f"Payment {self.id} ({self.status})"


class Refund(models.Model):
    """A refund for an order."""

    class Status(models.TextChoices):
        REQUESTED = "requested", "Requested"
        PROCESSING = "processing", "Processing"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"
        REJECTED = "rejected", "Rejected"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey("orders.Order", on_delete=models.CASCADE, related_name="refunds")
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name="refunds")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.REQUESTED)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default="INR")
    reason = models.TextField(blank=True, default="")
    provider_refund_id = models.CharField(max_length=200, blank=True, default="")
    processed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "refunds"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Refund {self.id} ({self.status})"


class WebhookEvent(models.Model):
    """Tracks received payment webhook events for deduplication."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    provider = models.CharField(max_length=20)
    event_id = models.CharField(max_length=200, unique=True)
    event_type = models.CharField(max_length=100)
    payload = models.JSONField(default=dict)
    processed = models.BooleanField(default=False)
    processing_error = models.TextField(blank=True, default="")
    received_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "webhook_events"
        indexes = [
            models.Index(fields=["event_id"]),
            models.Index(fields=["provider", "processed"]),
        ]

    def __str__(self):
        return f"{self.provider}: {self.event_type} ({self.event_id})"
