"""
Local development settings.
"""

from .base import *  # noqa: F401, F403

DEBUG = True
ALLOWED_HOSTS = ["*"]

ENABLE_DEBUG_TOOLBAR = config("ENABLE_DEBUG_TOOLBAR", default=False, cast=bool)  # noqa: F405
if ENABLE_DEBUG_TOOLBAR:
    INSTALLED_APPS += ["debug_toolbar"]  # noqa: F405
    MIDDLEWARE.insert(0, "debug_toolbar.middleware.DebugToolbarMiddleware")  # noqa: F405

INTERNAL_IPS = ["127.0.0.1"]

# Use console email backend for development
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# Simplified password validation for dev
AUTH_PASSWORD_VALIDATORS = []

# Disable throttling in dev
REST_FRAMEWORK["DEFAULT_THROTTLE_CLASSES"] = []  # noqa: F405
REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"] = {}  # noqa: F405

USE_SQLITE = config("USE_SQLITE", default=True, cast=bool)  # noqa: F405
if USE_SQLITE:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",  # noqa: F405
        }
    }
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
            "LOCATION": "beyond-tickets-cache",
        }
    }
