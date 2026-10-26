"""
URL patterns for reservations app.
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import ReservationViewSet

app_name = "reservations"

router = DefaultRouter()
router.register("", ReservationViewSet, basename="reservation")

urlpatterns = [
    path("", include(router.urls)),
]
