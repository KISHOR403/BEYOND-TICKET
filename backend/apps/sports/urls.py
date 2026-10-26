"""
URL patterns for sports app.
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import MatchFixtureViewSet, TeamViewSet

app_name = "sports"

router = DefaultRouter()
router.register("fixtures", MatchFixtureViewSet, basename="match-fixture")
router.register("teams", TeamViewSet, basename="team")

urlpatterns = [
    path("", include(router.urls)),
]
