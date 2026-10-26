"""
Celery app configuration for Beyond Tickets.
"""

import os

from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.local")

app = Celery("beyond_tickets")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()
