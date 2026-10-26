"""
Views for accounts app.
"""

from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .serializers import (
    ChangePasswordSerializer,
    UserProfileSerializer,
    UserRegistrationSerializer,
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """Register a new customer account."""

    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        profile = UserProfileSerializer(user)
        return Response(
            {"message": "Registration successful.", "user": profile.data},
            status=status.HTTP_201_CREATED,
        )


class ProfileView(generics.RetrieveUpdateAPIView):
    """Get or update the authenticated user's profile."""

    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    """Change the authenticated user's password."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save()
        return Response({"message": "Password updated successfully."}, status=status.HTTP_200_OK)


class LoginView(TokenObtainPairView):
    """Login and obtain JWT tokens."""

    permission_classes = [permissions.AllowAny]


class RefreshTokenView(TokenRefreshView):
    """Refresh JWT access token."""

    permission_classes = [permissions.AllowAny]
