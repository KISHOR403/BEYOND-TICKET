"""
Views for sports app.
"""

from rest_framework import permissions, viewsets
from .models import MatchFixture, Team
from .serializers import MatchFixtureSerializer, TeamSerializer


class MatchFixtureViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.AllowAny]
    queryset = MatchFixture.objects.select_related("home_team", "away_team", "listing__venue").all()
    serializer_class = MatchFixtureSerializer


class TeamViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.AllowAny]
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
