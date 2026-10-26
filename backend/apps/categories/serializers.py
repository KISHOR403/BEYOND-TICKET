"""
Serializers for categories app.
"""

from rest_framework import serializers

from .models import Category


class CategorySerializer(serializers.ModelSerializer):
    listing_count = serializers.IntegerField(read_only=True, required=False)

    class Meta:
        model = Category
        fields = [
            "id", "name", "slug", "description", "icon", "color",
            "image", "is_active", "sort_order", "local_inventory",
            "listing_count",
        ]
