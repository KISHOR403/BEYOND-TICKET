"""
Sports event specific models.
"""

import uuid

from django.db import models


class Team(models.Model):
    """A sports team."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    short_name = models.CharField(max_length=10, blank=True, default="")
    logo = models.ImageField(upload_to="teams/", blank=True, null=True)
    sport = models.CharField(max_length=50, default="cricket")

    class Meta:
        db_table = "teams"

    def __str__(self):
        return self.name


class MatchFixture(models.Model):
    """A sports match fixture linked to a listing."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    listing = models.OneToOneField(
        "listings.Listing", on_delete=models.CASCADE, related_name="match_fixture"
    )
    home_team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="home_matches")
    away_team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="away_matches")
    sport = models.CharField(max_length=50, default="cricket")
    league = models.CharField(max_length=100, blank=True, default="")
    match_date = models.DateTimeField()

    class Meta:
        db_table = "match_fixtures"

    def __str__(self):
        return f"{self.home_team} vs {self.away_team}"


class StadiumSection(models.Model):
    """Sections within a sports venue."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    venue = models.ForeignKey("listings.Venue", on_delete=models.CASCADE, related_name="sections")
    name = models.CharField(max_length=100)
    capacity = models.PositiveIntegerField()
    description = models.TextField(blank=True, default="")

    class Meta:
        db_table = "stadium_sections"

    def __str__(self):
        return f"{self.venue.name} — {self.name}"
