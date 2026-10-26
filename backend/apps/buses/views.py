"""
Views for buses app.
"""

from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import BusTrip, Route
from .serializers import BusTripSerializer


class BusTripViewSet(viewsets.ReadOnlyModelViewSet):
    """Public bus routes and trips discovery."""

    permission_classes = [permissions.AllowAny]
    serializer_class = BusTripSerializer

    def get_queryset(self):
        qs = (
            BusTrip.objects.filter(is_active=True)
            .select_related("operator", "route")
            .prefetch_related("boarding_points", "dropoff_points")
        )
        origin = self.request.query_params.get("origin")
        destination = self.request.query_params.get("destination")
        bus_type = self.request.query_params.get("bus_type")

        if origin:
            qs = qs.filter(route__origin_city__iexact=origin)
        if destination:
            qs = qs.filter(route__destination_city__iexact=destination)
        if bus_type:
            qs = qs.filter(bus_type=bus_type)

        return qs

    @action(detail=False, methods=["get"], url_path="popular-routes")
    def popular_routes(self, request):
        """Get popular bus routes."""
        routes = Route.objects.all()[:8]
        return Response([
            {
                "id": str(r.id),
                "origin": r.origin_city,
                "destination": r.destination_city,
                "duration_minutes": r.estimated_duration_minutes,
                "distance_km": r.distance_km,
            }
            for r in routes
        ])
