"""
Views for categories app.
"""

from django.db.models import Count
from rest_framework import viewsets, permissions

from .models import Category
from .serializers import CategorySerializer


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """List and retrieve categories."""

    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "slug"

    def get_queryset(self):
        return (
            Category.objects.filter(is_active=True)
            .annotate(listing_count=Count("listings"))
            .order_by("sort_order", "name")
        )
