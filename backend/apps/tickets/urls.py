"""
URL patterns for tickets app.
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import TicketViewSet

app_name = "tickets"

router = DefaultRouter()
router.register("", TicketViewSet, basename="ticket")

urlpatterns = [
    path("", include(router.urls)),
]
