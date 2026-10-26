"""
Serializers for reservations app.
"""

from rest_framework import serializers
from apps.inventory.models import TicketType, SeatInventory, InventoryPool
from apps.listings.models import Listing, Session
from .models import Reservation, ReservationItem


class ReservationItemCreateSerializer(serializers.Serializer):
    ticket_type_id = serializers.UUIDField()
    seat_id = serializers.UUIDField(required=False, allow_null=True)
    quantity = serializers.IntegerField(min_value=1, default=1)


class ReservationCreateSerializer(serializers.Serializer):
    listing_id = serializers.UUIDField()
    session_id = serializers.UUIDField(required=False, allow_null=True)
    items = ReservationItemCreateSerializer(many=True)
    idempotency_key = serializers.CharField(max_length=100, required=False, allow_blank=True)


class ReservationItemSerializer(serializers.ModelSerializer):
    ticket_type_name = serializers.CharField(source="ticket_type.name", read_only=True)
    seat_label = serializers.SerializerMethodField()

    class Meta:
        model = ReservationItem
        fields = [
            "id",
            "ticket_type",
            "ticket_type_name",
            "seat",
            "seat_label",
            "quantity",
            "unit_price",
            "total_price",
        ]

    def get_seat_label(self, obj):
        if obj.seat:
            sec = f"{obj.seat.section} " if obj.seat.section else ""
            row = f"Row {obj.seat.row} " if obj.seat.row else ""
            return f"{sec}{row}Seat {obj.seat.seat_number}".strip()
        return None


class ReservationSerializer(serializers.ModelSerializer):
    items = ReservationItemSerializer(many=True, read_only=True)
    listing_title = serializers.CharField(source="listing.title", read_only=True)
    listing_slug = serializers.CharField(source="listing.slug", read_only=True)
    is_expired = serializers.BooleanField(read_only=True)

    class Meta:
        model = Reservation
        fields = [
            "id",
            "listing",
            "listing_title",
            "listing_slug",
            "session",
            "status",
            "expires_at",
            "subtotal",
            "platform_fee",
            "tax",
            "total",
            "currency",
            "items",
            "is_expired",
            "created_at",
        ]
