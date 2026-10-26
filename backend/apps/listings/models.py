"""
Shared models for listings, venues, organizations, sessions, and media.
These are the central models used across all 8 ticket categories.
"""

import uuid

from django.conf import settings
from django.db import models


class Organization(models.Model):
    """An organizer/company that manages listings."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True, default="")
    logo = models.ImageField(upload_to="organizations/logos/", blank=True, null=True)
    website = models.URLField(blank=True, default="")
    email = models.EmailField(blank=True, default="")
    phone = models.CharField(max_length=20, blank=True, default="")
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "organizations"
        ordering = ["name"]

    def __str__(self):
        return self.name


class OrganizationMember(models.Model):
    """Maps users to organizations with specific roles."""

    class MemberRole(models.TextChoices):
        OWNER = "owner", "Owner"
        MANAGER = "manager", "Manager"
        CHECKIN = "checkin", "Check-in Staff"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="members"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="organization_memberships"
    )
    role = models.CharField(max_length=20, choices=MemberRole.choices, default=MemberRole.MANAGER)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "organization_members"
        unique_together = ("organization", "user")

    def __str__(self):
        return f"{self.user.email} → {self.organization.name} ({self.role})"


class Venue(models.Model):
    """A physical location where events take place."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    address = models.TextField(blank=True, default="")
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100, blank=True, default="")
    country = models.CharField(max_length=100, default="India")
    postal_code = models.CharField(max_length=20, blank=True, default="")
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    timezone = models.CharField(max_length=50, default="Asia/Kolkata")
    capacity = models.PositiveIntegerField(blank=True, null=True)
    amenities = models.JSONField(default=list, blank=True)
    instructions = models.TextField(blank=True, default="", help_text="Directions, parking, etc.")
    image = models.ImageField(upload_to="venues/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "venues"
        ordering = ["name"]
        indexes = [
            models.Index(fields=["city"]),
        ]

    def __str__(self):
        return f"{self.name}, {self.city}"


class Listing(models.Model):
    """
    A bookable listing. This is the shared model across all categories.
    Category-specific details are in linked models (e.g., ConcertDetail).
    """

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PENDING = "pending", "Pending Review"
        PUBLISHED = "published", "Published"
        CANCELLED = "cancelled", "Cancelled"
        COMPLETED = "completed", "Completed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=300)
    slug = models.SlugField(max_length=150, unique=True)
    description = models.TextField(blank=True, default="")
    short_description = models.CharField(max_length=300, blank=True, default="")

    category = models.ForeignKey(
        "categories.Category", on_delete=models.PROTECT, related_name="listings"
    )
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="listings"
    )
    venue = models.ForeignKey(
        Venue, on_delete=models.SET_NULL, null=True, blank=True, related_name="listings"
    )

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    is_featured = models.BooleanField(default=False)

    # Date range for the listing
    start_date = models.DateTimeField(blank=True, null=True)
    end_date = models.DateTimeField(blank=True, null=True)

    # Pricing display
    min_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    max_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default="INR")

    # Cover image
    cover_image = models.ImageField(upload_to="listings/covers/", blank=True, null=True)

    # Policy
    cancellation_policy = models.TextField(blank=True, default="")
    refund_policy = models.TextField(blank=True, default="")
    age_restriction = models.CharField(max_length=50, blank=True, default="")
    accessibility_info = models.TextField(blank=True, default="")

    # Metadata
    tags = models.JSONField(default=list, blank=True)
    meta = models.JSONField(default=dict, blank=True, help_text="Category-specific metadata")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "listings"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "category"]),
            models.Index(fields=["start_date"]),
            models.Index(fields=["-created_at"]),
            models.Index(fields=["min_price"]),
        ]

    def __str__(self):
        return self.title


class Session(models.Model):
    """
    A specific date/time occurrence for a listing.
    E.g., a concert happening on a specific date, a movie showtime, a bus trip.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="sessions")
    title = models.CharField(max_length=200, blank=True, default="")
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(blank=True, null=True)
    doors_open = models.DateTimeField(blank=True, null=True)
    venue = models.ForeignKey(Venue, on_delete=models.SET_NULL, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "sessions"
        ordering = ["start_time"]
        indexes = [
            models.Index(fields=["listing", "start_time"]),
        ]

    def __str__(self):
        return f"{self.listing.title} — {self.start_time}"


class MediaAsset(models.Model):
    """Images and media attached to a listing."""

    class MediaType(models.TextChoices):
        IMAGE = "image", "Image"
        VIDEO = "video", "Video"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="media")
    media_type = models.CharField(max_length=10, choices=MediaType.choices, default=MediaType.IMAGE)
    file = models.FileField(upload_to="listings/media/")
    alt_text = models.CharField(max_length=200, blank=True, default="")
    sort_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "media_assets"
        ordering = ["sort_order"]

    def __str__(self):
        return f"{self.listing.title} — {self.media_type}"
