"""
Views for movies app.
"""

from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Movie, MovieShowtime, ScreenSeat
from .serializers import (
    MovieDetailSerializer,
    MovieListSerializer,
    MovieShowtimeSerializer,
    ScreenSeatSerializer,
)


class MovieViewSet(viewsets.ReadOnlyModelViewSet):
    """Public movies and showtimes API."""

    permission_classes = [permissions.AllowAny]
    lookup_field = "slug"

    def get_serializer_class(self):
        if self.action == "retrieve":
            return MovieDetailSerializer
        return MovieListSerializer

    def get_queryset(self):
        return Movie.objects.filter(is_active=True).prefetch_related(
            "showtimes__screen__cinema__venue",
        )

    @action(detail=False, methods=["get"], url_path="showtimes/(?P<showtime_id>[^/.]+)/seats")
    def showtime_seats(self, request, showtime_id=None):
        """Get seat layout and booked seats for a movie showtime."""
        showtime = MovieShowtime.objects.filter(id=showtime_id).select_related("screen").first()
        if not showtime:
            return Response({"detail": "Showtime not found."}, status=status.HTTP_404_NOT_FOUND)

        seats = ScreenSeat.objects.filter(screen=showtime.screen, is_available=True).order_by("row", "seat_number")
        
        # If showtime is linked to session, fetch booked/held seats from SeatInventory
        booked_seat_numbers = set()
        if showtime.session:
            from apps.inventory.models import SeatInventory
            held_or_sold = SeatInventory.objects.filter(
                session=showtime.session,
                status__in=[SeatInventory.SeatStatus.HELD, SeatInventory.SeatStatus.SOLD],
            ).values_list("seat_number", flat=True)
            booked_seat_numbers = set(held_or_sold)

        seat_list = []
        for s in seats:
            seat_label = f"{s.row}{s.seat_number}"
            is_booked = seat_label in booked_seat_numbers
            price = showtime.prices.get(s.category, 200)
            seat_list.append({
                "id": str(s.id),
                "row": s.row,
                "seat_number": s.seat_number,
                "label": seat_label,
                "category": s.category,
                "price": price,
                "is_booked": is_booked,
                "x": s.x_position,
                "y": s.y_position,
            })

        return Response({
            "showtime_id": str(showtime.id),
            "movie_title": showtime.movie.title,
            "screen_name": showtime.screen.name,
            "prices": showtime.prices,
            "seats": seat_list,
        })
