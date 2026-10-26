"""
Health check endpoint.
"""

from django.http import JsonResponse
from django.db import connection


def health_check(request):
    """Simple health check that verifies DB connectivity."""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        return JsonResponse({"status": "healthy", "database": "connected"})
    except Exception as e:
        return JsonResponse(
            {"status": "unhealthy", "database": str(e)},
            status=503,
        )
