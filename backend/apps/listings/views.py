"""
Views for listings app.
"""

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.accounts.models import SavedListing

from .models import Listing, Venue
from .serializers import ListingCardSerializer, ListingDetailSerializer, VenueSerializer


class ListingViewSet(viewsets.ReadOnlyModelViewSet):
    """Public listing discovery API."""

    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        "category__slug": ["exact"],
        "status": ["exact"],
        "venue__city": ["exact", "icontains"],
        "min_price": ["gte", "lte"],
        "max_price": ["gte", "lte"],
        "start_date": ["gte", "lte"],
        "is_featured": ["exact"],
    }
    search_fields = ["title", "description", "venue__name", "venue__city", "organization__name", "tags"]
    ordering_fields = ["start_date", "min_price", "created_at"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ListingDetailSerializer
        return ListingCardSerializer

    def get_queryset(self):
        return (
            Listing.objects.filter(status=Listing.Status.PUBLISHED)
            .select_related("category", "organization", "venue")
            .prefetch_related("sessions", "media", "ticket_types__inventory_pool")
        )

    def get_object(self):
        lookup = self.kwargs.get("pk")
        queryset = self.filter_queryset(self.get_queryset())
        import uuid
        obj = None
        try:
            val = uuid.UUID(str(lookup))
            obj = queryset.filter(id=val).first()
        except (ValueError, TypeError):
            pass
        if not obj:
            obj = queryset.filter(slug=lookup).first()
        if not obj:
            from rest_framework.exceptions import NotFound
            raise NotFound("Listing not found.")
        self.check_object_permissions(self.request, obj)
        return obj

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def save_listing(self, request, pk=None):
        """Save/unsave a listing for the authenticated user."""
        listing = self.get_object()
        saved, created = SavedListing.objects.get_or_create(
            user=request.user, listing=listing
        )
        if not created:
            saved.delete()
            return Response({"saved": False})
        return Response({"saved": True})

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def saved(self, request):
        """Get all saved listings for the authenticated user."""
        saved_ids = SavedListing.objects.filter(user=request.user).values_list("listing_id", flat=True)
        listings = self.get_queryset().filter(id__in=saved_ids)
        page = self.paginate_queryset(listings)
        if page is not None:
            serializer = ListingCardSerializer(page, many=True, context={"request": request})
            return self.get_paginated_response(serializer.data)
        serializer = ListingCardSerializer(listings, many=True, context={"request": request})
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def featured(self, request):
        """Get featured listings."""
        listings = self.get_queryset().filter(is_featured=True)[:12]
        serializer = ListingCardSerializer(listings, many=True, context={"request": request})
        return Response(serializer.data)


class VenueViewSet(viewsets.ReadOnlyModelViewSet):
    """Public venue discovery."""

    queryset = Venue.objects.all()
    serializer_class = VenueSerializer
    permission_classes = [permissions.AllowAny]
    search_fields = ["name", "city"]
