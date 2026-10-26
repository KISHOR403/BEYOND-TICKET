from django.contrib import admin

from .models import Listing, MediaAsset, Organization, OrganizationMember, Session, Venue


class MediaAssetInline(admin.TabularInline):
    model = MediaAsset
    extra = 0


class SessionInline(admin.TabularInline):
    model = Session
    extra = 0


class OrganizationMemberInline(admin.TabularInline):
    model = OrganizationMember
    extra = 0


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ("name", "is_verified", "is_active", "created_at")
    list_filter = ("is_verified", "is_active")
    search_fields = ("name", "email")
    inlines = [OrganizationMemberInline]


@admin.register(Venue)
class VenueAdmin(admin.ModelAdmin):
    list_display = ("name", "city", "state", "country", "capacity")
    list_filter = ("city", "country")
    search_fields = ("name", "city")


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "organization", "status", "start_date", "min_price")
    list_filter = ("status", "category", "is_featured")
    search_fields = ("title", "description")
    prepopulated_fields = {"slug": ("title",)}
    inlines = [SessionInline, MediaAssetInline]
