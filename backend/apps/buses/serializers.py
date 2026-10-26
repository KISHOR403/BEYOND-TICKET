"""
Serializers for buses app.
"""

from rest_framework import serializers
from .models import BoardingPoint, BusOperator, BusTrip, DropoffPoint, Route


class BoardingPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = BoardingPoint
        fields = ["id", "name", "address", "time", "landmark"]


class DropoffPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = DropoffPoint
        fields = ["id", "name", "address", "time"]


class BusOperatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusOperator
        fields = ["id", "name", "code", "rating", "amenities"]


class BusTripSerializer(serializers.ModelSerializer):
    operator = BusOperatorSerializer(read_only=True)
    origin_city = serializers.CharField(source="route.origin_city", read_only=True)
    destination_city = serializers.CharField(source="route.destination_city", read_only=True)
    duration_minutes = serializers.IntegerField(source="route.estimated_duration_minutes", read_only=True)
    boarding_points = BoardingPointSerializer(many=True, read_only=True)
    dropoff_points = DropoffPointSerializer(many=True, read_only=True)

    class Meta:
        model = BusTrip
        fields = [
            "id",
            "operator",
            "origin_city",
            "destination_city",
            "duration_minutes",
            "bus_type",
            "departure_time",
            "arrival_time",
            "total_seats",
            "available_seats",
            "price",
            "currency",
            "amenities",
            "seat_layout",
            "boarding_points",
            "dropoff_points",
        ]
