"""
URL patterns for listings app.
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ListingViewSet, VenueViewSet

app_name = "listings"

router = DefaultRouter()
router.register("", ListingViewSet, basename="listing")

venue_router = DefaultRouter()
venue_router.register("", VenueViewSet, basename="venue")

urlpatterns = [
    path("", include(router.urls)),
    path("venues/", include(venue_router.urls)),
]
