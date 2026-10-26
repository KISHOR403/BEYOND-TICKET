from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

User = get_user_model()


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("email", "username", "first_name", "last_name", "role", "is_active", "email_verified")
    list_filter = ("role", "is_active", "email_verified", "is_staff")
    search_fields = ("email", "username", "first_name", "last_name")
    ordering = ("-created_at",)
    fieldsets = BaseUserAdmin.fieldsets + (
        ("Beyond Tickets", {"fields": ("phone", "phone_verified", "email_verified", "role", "city", "date_of_birth")}),
        ("Notifications", {"fields": ("notify_email", "notify_sms", "notify_push")}),
    )
