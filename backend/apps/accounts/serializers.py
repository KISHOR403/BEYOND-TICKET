"""
Serializers for accounts app.
"""

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""

    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "email", "username", "first_name", "last_name",
            "phone", "password", "password_confirm",
        ]

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password_confirm"):
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data["email"],
            username=validated_data["username"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            phone=validated_data.get("phone", ""),
            password=validated_data["password"],
        )
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile."""

    full_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = [
            "id", "email", "username", "first_name", "last_name", "full_name",
            "phone", "phone_verified", "email_verified", "role", "avatar",
            "date_of_birth", "city", "notify_email", "notify_sms", "notify_push",
            "created_at",
        ]
        read_only_fields = ["id", "email", "role", "email_verified", "phone_verified", "created_at"]


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change."""

    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value
