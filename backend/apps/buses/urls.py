"""
URL patterns for buses app.
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import BusTripViewSet

app_name = "buses"

router = DefaultRouter()
router.register("trips", BusTripViewSet, basename="bus-trip")

urlpatterns = [
    path("", include(router.urls)),
]
