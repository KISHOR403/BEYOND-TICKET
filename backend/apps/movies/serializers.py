"""
Serializers for movies app.
"""

from rest_framework import serializers
from .models import Cinema, Movie, MovieShowtime, Screen, ScreenSeat


class ScreenSeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScreenSeat
        fields = [
            "id",
            "row",
            "seat_number",
            "category",
            "is_available",
            "x_position",
            "y_position",
        ]


class MovieShowtimeSerializer(serializers.ModelSerializer):
    cinema_name = serializers.CharField(source="screen.cinema.name", read_only=True)
    cinema_city = serializers.CharField(source="screen.cinema.venue.city", read_only=True)
    screen_name = serializers.CharField(source="screen.name", read_only=True)
    screen_type = serializers.CharField(source="screen.screen_type", read_only=True)

    class Meta:
        model = MovieShowtime
        fields = [
            "id",
            "listing",
            "session",
            "cinema_name",
            "cinema_city",
            "screen_name",
            "screen_type",
            "show_date",
            "show_time",
            "language",
            "format",
            "prices",
        ]


class MovieListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movie
        fields = [
            "id",
            "title",
            "slug",
            "description",
            "genre",
            "language",
            "duration_minutes",
            "rating",
            "release_date",
        ]


class MovieDetailSerializer(serializers.ModelSerializer):
    showtimes = MovieShowtimeSerializer(many=True, read_only=True)

    class Meta:
        model = Movie
        fields = [
            "id",
            "title",
            "slug",
            "description",
            "genre",
            "language",
            "duration_minutes",
            "rating",
            "release_date",
            "showtimes",
        ]
