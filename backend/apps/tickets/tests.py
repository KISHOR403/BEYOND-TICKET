import pytest
from rest_framework.test import APIClient
from apps.accounts.models import User
from apps.listings.models import Listing, Venue, Organization
from apps.categories.models import Category
from apps.inventory.models import TicketType, InventoryPool
from apps.tickets.models import IssuedTicket

@pytest.fixture
def booking_setup():
    user = User.objects.create_user(email="scanner_test@example.com", username="scanner_test", password="password123")
    cat = Category.objects.create(name="Sports", slug="sports", icon="trophy", color="#DC2626")
    venue = Venue.objects.create(name="Wankhede Stadium", city="Mumbai", address="Churchgate")
    org = Organization.objects.create(name="Cricket Board", slug="cricket-board")
    listing = Listing.objects.create(
        title="IPL Match Fixture",
        slug="ipl-match-fixture",
        category=cat,
        venue=venue,
        organization=org,
        status=Listing.Status.PUBLISHED,
        min_price=1000,
        start_date="2026-11-20T19:30:00Z",
    )
    tt = TicketType.objects.create(
        listing=listing,
        name="Pavilion Stand",
        price=1000,
        currency="INR",
        max_per_order=6,
    )
    InventoryPool.objects.create(
        ticket_type=tt,
        total_capacity=100,
    )
    return {"user": user, "listing": listing, "ticket_type": tt}

@pytest.mark.django_db
def test_ticket_validation_and_duplicate_scan(booking_setup):
    client = APIClient()
    user = booking_setup["user"]
    listing = booking_setup["listing"]
    tt = booking_setup["ticket_type"]

    client.force_authenticate(user=user)

    # 1. Create reservation
    res = client.post(
        "/api/v1/reservations/",
        {"listing_id": str(listing.id), "items": [{"ticket_type_id": str(tt.id), "quantity": 1}]},
        format="json",
    )
    assert res.status_code == 201
    reservation_id = res.data["id"]

    # 2. Create order
    order_res = client.post(
        "/api/v1/orders/",
        {"reservation_id": reservation_id, "contact_email": "scanner_test@example.com"},
        format="json",
    )
    assert order_res.status_code == 201
    order_id = order_res.data["id"]

    # 3. Create payment intent and verify
    intent_res = client.post("/api/v1/payments/create-intent/", {"order_id": order_id, "provider": "sandbox"}, format="json")
    assert intent_res.status_code == 200

    verify_res = client.post("/api/v1/payments/verify/", {"order_id": order_id, "is_sandbox": True}, format="json")
    assert verify_res.status_code == 200
    assert verify_res.data["success"] is True

    # 4. Check ticket issuance
    ticket = IssuedTicket.objects.filter(order_id=order_id).first()
    assert ticket is not None
    assert ticket.status == IssuedTicket.Status.ACTIVE
    assert ticket.qr_code is not None

    # 5. Scan at gate (first entry)
    scan1 = client.post("/api/v1/tickets/validate/", {"token": ticket.token}, format="json")
    assert scan1.status_code == 200
    assert scan1.data["valid"] is True
    assert "Success" in scan1.data["message"]

    # 6. Re-scan at gate (duplicate scan prevented)
    scan2 = client.post("/api/v1/tickets/validate/", {"token": ticket.token}, format="json")
    assert scan2.status_code == 400
    assert scan2.data["valid"] is False
    assert "already scanned" in scan2.data["message"].lower()
