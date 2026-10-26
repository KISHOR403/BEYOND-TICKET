"""
Movie-specific models. Movies use external inventory adapters.
"""

import uuid

from django.db import models


class Movie(models.Model):
    """A movie entity."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=300)
    slug = models.SlugField(max_length=150, unique=True)
    description = models.TextField(blank=True, default="")
    genre = models.JSONField(default=list, blank=True)
    language = models.CharField(max_length=50, default="Hindi")
    duration_minutes = models.PositiveIntegerField()
    rating = models.CharField(max_length=10, blank=True, default="", help_text="U, UA, A, etc.")
    poster = models.ImageField(upload_to="movies/posters/", blank=True, null=True)
    banner = models.ImageField(upload_to="movies/banners/", blank=True, null=True)
    release_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "movies"
        ordering = ["-release_date"]

    def __str__(self):
        return self.title


class Cinema(models.Model):
    """A cinema/theater chain location."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    venue = models.OneToOneField(
        "listings.Venue", on_delete=models.CASCADE, related_name="cinema"
    )
    chain = models.CharField(max_length=100, blank=True, default="")
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "cinemas"

    def __str__(self):
        return self.name


class Screen(models.Model):
    """A screen within a cinema."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    cinema = models.ForeignKey(Cinema, on_delete=models.CASCADE, related_name="screens")
    name = models.CharField(max_length=50)
    capacity = models.PositiveIntegerField()
    screen_type = models.CharField(max_length=50, default="Standard", help_text="IMAX, 4DX, Standard, etc.")
    has_recliner = models.BooleanField(default=False)

    class Meta:
        db_table = "screens"

    def __str__(self):
        return f"{self.cinema.name} — {self.name}"


class ScreenSeat(models.Model):
    """A physical seat in a screen — defines the seat map."""

    class SeatCategory(models.TextChoices):
        SILVER = "silver", "Silver"
        GOLD = "gold", "Gold"
        PLATINUM = "platinum", "Platinum"
        RECLINER = "recliner", "Recliner"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    screen = models.ForeignKey(Screen, on_delete=models.CASCADE, related_name="seats")
    row = models.CharField(max_length=5)
    seat_number = models.PositiveIntegerField()
    category = models.CharField(max_length=20, choices=SeatCategory.choices, default=SeatCategory.SILVER)
    is_available = models.BooleanField(default=True, help_text="False if seat is permanently blocked")
    x_position = models.IntegerField(default=0, help_text="Grid x position for rendering")
    y_position = models.IntegerField(default=0, help_text="Grid y position for rendering")

    class Meta:
        db_table = "screen_seats"
        constraints = [
            models.UniqueConstraint(fields=["screen", "row", "seat_number"], name="unique_screen_seat"),
        ]

    def __str__(self):
        return f"{self.row}{self.seat_number} ({self.category})"


class MovieShowtime(models.Model):
    """A specific showtime for a movie at a screen."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name="showtimes")
    screen = models.ForeignKey(Screen, on_delete=models.CASCADE, related_name="showtimes")
    listing = models.ForeignKey(
        "listings.Listing", on_delete=models.CASCADE, null=True, blank=True,
        related_name="movie_showtimes",
    )
    session = models.OneToOneField(
        "listings.Session", on_delete=models.CASCADE, null=True, blank=True,
        related_name="movie_showtime",
    )
    show_date = models.DateField()
    show_time = models.TimeField()
    language = models.CharField(max_length=50, blank=True, default="")
    format = models.CharField(max_length=20, default="2D", help_text="2D, 3D, IMAX, etc.")
    is_active = models.BooleanField(default=True)
    # Price per seat category for this showtime
    prices = models.JSONField(
        default=dict, blank=True,
        help_text="e.g. {'silver': 150, 'gold': 250, 'platinum': 350}",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "movie_showtimes"
        ordering = ["show_date", "show_time"]
        indexes = [
            models.Index(fields=["movie", "show_date"]),
        ]

    def __str__(self):
        return f"{self.movie.title} @ {self.screen} — {self.show_date} {self.show_time}"
