"""
URL configuration for Beyond Tickets.
"""

from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

api_v1_patterns = [
    path("auth/", include("apps.accounts.urls")),
    path("categories/", include("apps.categories.urls")),
    path("listings/", include("apps.listings.urls")),
    path("reservations/", include("apps.reservations.urls")),
    path("orders/", include("apps.orders.urls")),
    path("payments/", include("apps.payments.urls")),
    path("tickets/", include("apps.tickets.urls")),
    path("organizer/", include("apps.organizer.urls")),
    # Category-specific endpoints
    path("concerts/", include("apps.concerts.urls")),
    path("sports/", include("apps.sports.urls")),
    path("comedy/", include("apps.comedy.urls")),
    path("activities/", include("apps.activities.urls")),
    path("cultural/", include("apps.cultural.urls")),
    path("movies/", include("apps.movies.urls")),
    path("buses/", include("apps.buses.urls")),
    path("conferences/", include("apps.conferences.urls")),
]

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include(api_v1_patterns)),
    # OpenAPI
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
    # Health check
    path("health/", include("apps.accounts.health_urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    try:
        import debug_toolbar
        urlpatterns += [path("__debug__/", include(debug_toolbar.urls))]
    except ImportError:
        pass
