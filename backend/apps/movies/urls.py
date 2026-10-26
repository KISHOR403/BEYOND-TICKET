"""
URL patterns for movies app.
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import MovieViewSet

app_name = "movies"

router = DefaultRouter()
router.register("", MovieViewSet, basename="movie")

urlpatterns = [
    path("", include(router.urls)),
]
