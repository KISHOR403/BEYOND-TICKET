"""
Category registry for Beyond Tickets.
"""

import uuid

from django.db import models


class Category(models.Model):
    """
    Central category registry. Each category represents a ticket vertical
    (concerts, sports, movies, buses, etc.).
    """

    class Slug(models.TextChoices):
        CONCERTS = "concerts", "Concerts & Live Events"
        SPORTS = "sports", "Sports Events"
        COMEDY = "comedy", "Comedy & Theatre"
        ACTIVITIES = "activities", "Activities & Attractions"
        CULTURAL = "cultural", "Cultural & Local Events"
        MOVIES = "movies", "Movies"
        BUSES = "buses", "Bus Tickets"
        CONFERENCES = "conferences", "Conferences & Workshops"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=50, unique=True)
    description = models.TextField(blank=True, default="")
    icon = models.CharField(max_length=50, blank=True, default="", help_text="Lucide icon name")
    color = models.CharField(max_length=7, blank=True, default="#4F46E5", help_text="Hex color code")
    image = models.ImageField(upload_to="categories/", blank=True, null=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.IntegerField(default=0)
    # Whether inventory is managed locally (False = external adapter)
    local_inventory = models.BooleanField(
        default=True,
        help_text="True if platform manages inventory; False if external adapter required",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "categories"
        verbose_name = "Category"
        verbose_name_plural = "Categories"
        ordering = ["sort_order", "name"]

    def __str__(self):
        return self.name
