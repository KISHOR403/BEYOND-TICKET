"""
Serializers for listings app.
"""

from rest_framework import serializers

from apps.categories.serializers import CategorySerializer

from .models import Listing, MediaAsset, Organization, Session, Venue


class VenueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Venue
        fields = [
            "id", "name", "address", "city", "state", "country",
            "postal_code", "latitude", "longitude", "timezone",
            "capacity", "amenities", "instructions", "image",
        ]


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = [
            "id", "name", "slug", "description", "logo",
            "website", "is_verified",
        ]


class MediaAssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = MediaAsset
        fields = ["id", "media_type", "file", "alt_text", "sort_order"]


class SessionSerializer(serializers.ModelSerializer):
    venue = VenueSerializer(read_only=True)

    class Meta:
        model = Session
        fields = [
            "id", "title", "start_time", "end_time", "doors_open",
            "venue", "is_active", "notes",
        ]


class ListingCardSerializer(serializers.ModelSerializer):
    """Compact serializer for listing cards in lists/grids."""

    category = CategorySerializer(read_only=True)
    organization = OrganizationSerializer(read_only=True)
    venue_name = serializers.CharField(source="venue.name", read_only=True, default=None)
    venue_city = serializers.CharField(source="venue.city", read_only=True, default=None)

    class Meta:
        model = Listing
        fields = [
            "id", "title", "slug", "short_description", "category",
            "organization", "venue_name", "venue_city", "status",
            "is_featured", "start_date", "end_date", "min_price",
            "max_price", "currency", "cover_image", "tags",
        ]


class TicketTypeBriefSerializer(serializers.ModelSerializer):
    available = serializers.SerializerMethodField()

    class Meta:
        from apps.inventory.models import TicketType
        model = TicketType
        fields = [
            "id", "name", "description", "price", "currency",
            "max_per_order", "is_active", "session", "available",
        ]

    def get_available(self, obj):
        pool = getattr(obj, "inventory_pool", None)
        if pool:
            return pool.available
        return 100


class ListingDetailSerializer(serializers.ModelSerializer):
    """Full serializer for listing detail page."""

    category = CategorySerializer(read_only=True)
    organization = OrganizationSerializer(read_only=True)
    venue = VenueSerializer(read_only=True)
    sessions = SessionSerializer(many=True, read_only=True)
    media = MediaAssetSerializer(many=True, read_only=True)
    ticket_types = TicketTypeBriefSerializer(many=True, read_only=True)
    is_saved = serializers.SerializerMethodField()

    class Meta:
        model = Listing
        fields = [
            "id", "title", "slug", "description", "short_description",
            "category", "organization", "venue", "status", "is_featured",
            "start_date", "end_date", "min_price", "max_price", "currency",
            "cover_image", "cancellation_policy", "refund_policy",
            "age_restriction", "accessibility_info", "tags", "meta",
            "sessions", "media", "ticket_types", "is_saved", "created_at",
        ]

    def get_is_saved(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.saved_by.filter(user=request.user).exists()
        return False
