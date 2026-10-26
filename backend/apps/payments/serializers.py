"""
Serializers for payments app.
"""

from rest_framework import serializers
from .models import Payment, Refund


class PaymentIntentSerializer(serializers.Serializer):
    order_id = serializers.UUIDField()
    provider = serializers.ChoiceField(
        choices=Payment.Provider.choices,
        default=Payment.Provider.RAZORPAY,
    )
    idempotency_key = serializers.CharField(max_length=100, required=False, allow_blank=True)


class PaymentVerifySerializer(serializers.Serializer):
    order_id = serializers.UUIDField()
    payment_id = serializers.UUIDField(required=False)
    provider_order_id = serializers.CharField(max_length=200, required=False, allow_blank=True)
    provider_payment_id = serializers.CharField(max_length=200, required=False, allow_blank=True)
    provider_signature = serializers.CharField(max_length=500, required=False, allow_blank=True)
    is_sandbox = serializers.BooleanField(default=False)


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            "id",
            "order",
            "provider",
            "status",
            "amount",
            "currency",
            "provider_order_id",
            "provider_payment_id",
            "created_at",
        ]


class RefundSerializer(serializers.ModelSerializer):
    class Meta:
        model = Refund
        fields = [
            "id",
            "order",
            "payment",
            "status",
            "amount",
            "currency",
            "reason",
            "created_at",
        ]
