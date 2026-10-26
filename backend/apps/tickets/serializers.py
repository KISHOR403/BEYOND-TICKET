"""
Serializers for tickets app.
"""

from rest_framework import serializers
from .models import IssuedTicket, TicketScan


class TicketScanSerializer(serializers.ModelSerializer):
    scanned_by_email = serializers.CharField(source="scanned_by.email", read_only=True)

    class Meta:
        model = TicketScan
        fields = [
            "id",
            "result",
            "scanned_at",
            "location",
            "device_info",
            "scanned_by_email",
        ]


class IssuedTicketSerializer(serializers.ModelSerializer):
    ticket_type_name = serializers.CharField(source="ticket_type.name", read_only=True)
    order_number = serializers.CharField(source="order.order_number", read_only=True)
    contact_email = serializers.CharField(source="order.contact_email", read_only=True)
    qr_code_url = serializers.SerializerMethodField()
    scans = TicketScanSerializer(many=True, read_only=True)

    class Meta:
        model = IssuedTicket
        fields = [
            "id",
            "order_number",
            "reference",
            "token",
            "status",
            "ticket_type_name",
            "event_title",
            "event_date",
            "venue_name",
            "seat_info",
            "qr_code_url",
            "contact_email",
            "issued_at",
            "used_at",
            "scans",
        ]

    def get_qr_code_url(self, obj):
        if obj.qr_code:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.qr_code.url)
            return obj.qr_code.url
        return None


class TicketValidateSerializer(serializers.Serializer):
    token = serializers.CharField(max_length=100)
    location = serializers.CharField(max_length=200, required=False, allow_blank=True)
    device_info = serializers.CharField(max_length=200, required=False, allow_blank=True)
