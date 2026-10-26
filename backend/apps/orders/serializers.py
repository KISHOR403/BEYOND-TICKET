"""
Serializers for orders app.
"""

from rest_framework import serializers
from .models import Order, OrderItem, Attendee


class AttendeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendee
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "phone",
            "age",
            "gender",
        ]


class OrderItemSerializer(serializers.ModelSerializer):
    ticket_type_name = serializers.CharField(source="ticket_type.name", read_only=True)
    seat_label = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
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


class OrderDetailSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    attendees = AttendeeSerializer(many=True, read_only=True)
    listing_title = serializers.CharField(source="listing.title", read_only=True)
    listing_slug = serializers.CharField(source="listing.slug", read_only=True)
    venue_name = serializers.CharField(source="listing.venue.name", read_only=True)
    venue_city = serializers.CharField(source="listing.venue.city", read_only=True)
    session_start = serializers.DateTimeField(source="session.start_time", read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "status",
            "listing",
            "listing_title",
            "listing_slug",
            "venue_name",
            "venue_city",
            "session",
            "session_start",
            "subtotal",
            "platform_fee",
            "tax",
            "discount",
            "total",
            "currency",
            "contact_email",
            "contact_phone",
            "notes",
            "items",
            "attendees",
            "created_at",
        ]


class OrderCreateSerializer(serializers.Serializer):
    reservation_id = serializers.UUIDField()
    contact_email = serializers.EmailField()
    contact_phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)
    attendees = AttendeeSerializer(many=True, required=False)
