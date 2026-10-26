"""
URL patterns for organizer app.
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import OrganizerDashboardViewSet

app_name = "organizer"

router = DefaultRouter()
router.register("dashboard", OrganizerDashboardViewSet, basename="organizer-dashboard")

urlpatterns = [
    path("", include(router.urls)),
]
