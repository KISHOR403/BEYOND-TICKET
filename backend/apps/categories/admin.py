from django.contrib import admin

from .models import Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "is_active", "local_inventory", "sort_order")
    list_filter = ("is_active", "local_inventory")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
