"""
Role-based permission classes for Beyond Tickets.
"""

from rest_framework import permissions


class IsCustomer(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)


class IsOrganizer(permissions.BasePermission):
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return (
            request.user.role in ["organizer", "admin"]
            or request.user.is_staff
            or request.user.is_superuser
        )


class IsCheckinStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return (
            request.user.role in ["checkin_staff", "organizer", "admin"]
            or request.user.is_staff
            or request.user.is_superuser
        )


class IsPlatformAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return (
            request.user.role == "admin"
            or request.user.is_staff
            or request.user.is_superuser
        )
