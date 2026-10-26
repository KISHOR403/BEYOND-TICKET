"""
Custom User model and related account models for Beyond Tickets.
"""

import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom user model with email as the primary identifier."""

    class Role(models.TextChoices):
        CUSTOMER = "customer", "Customer"
        ORGANIZER = "organizer", "Organizer"
        CHECKIN_STAFF = "checkin_staff", "Check-in Staff"
        SUPPORT = "support", "Support"
        ADMIN = "admin", "Platform Administrator"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField("email address", unique=True)
    phone = models.CharField(max_length=20, blank=True, default="")
    phone_verified = models.BooleanField(default=False)
    email_verified = models.BooleanField(default=False)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CUSTOMER)
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, default="")

    # Notification preferences
    notify_email = models.BooleanField(default=True)
    notify_sms = models.BooleanField(default=False)
    notify_push = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username", "first_name"]

    class Meta:
        db_table = "users"
        verbose_name = "User"
        verbose_name_plural = "Users"
        indexes = [
            models.Index(fields=["email"]),
            models.Index(fields=["role"]),
        ]

    def __str__(self):
        return self.email

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.username

    @property
    def is_organizer(self):
        return self.role in (self.Role.ORGANIZER, self.Role.ADMIN)

    @property
    def is_platform_admin(self):
        return self.role == self.Role.ADMIN


class SavedListing(models.Model):
    """User's saved/favorited listings."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="saved_listings")
    listing = models.ForeignKey(
        "listings.Listing", on_delete=models.CASCADE, related_name="saved_by"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "saved_listings"
        unique_together = ("user", "listing")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.email} saved {self.listing}"
