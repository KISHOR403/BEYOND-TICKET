"""
Serializers for sports app.
"""

from rest_framework import serializers
from .models import MatchFixture, Team, StadiumSection


class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ["id", "name", "short_name", "sport"]


class StadiumSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = StadiumSection
        fields = ["id", "name", "capacity", "description"]


class MatchFixtureSerializer(serializers.ModelSerializer):
    home_team = TeamSerializer(read_only=True)
    away_team = TeamSerializer(read_only=True)
    venue_name = serializers.CharField(source="listing.venue.name", read_only=True)
    listing_slug = serializers.CharField(source="listing.slug", read_only=True)

    class Meta:
        model = MatchFixture
        fields = [
            "id",
            "listing",
            "listing_slug",
            "home_team",
            "away_team",
            "sport",
            "league",
            "match_date",
            "venue_name",
        ]
