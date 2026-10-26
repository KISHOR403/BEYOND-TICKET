import pytest
from rest_framework.test import APIClient
from apps.listings.models import Listing, Venue, Organization
from apps.categories.models import Category

@pytest.fixture
def sample_category():
    return Category.objects.create(
        name="Concerts",
        slug="concerts",
        description="Live concerts",
        icon="music",
        color="#7C3AED",
    )

@pytest.fixture
def sample_listing(sample_category):
    venue = Venue.objects.create(name="Phoenix Arena", city="Mumbai", address="Lower Parel")
    org = Organization.objects.create(name="Test Org", slug="test-org")
    return Listing.objects.create(
        title="Live Arena Test",
        slug="live-arena-test",
        category=sample_category,
        venue=venue,
        organization=org,
        status=Listing.Status.PUBLISHED,
        min_price=500,
        start_date="2026-11-20T18:00:00Z",
    )

@pytest.mark.django_db
def test_list_published_listings(sample_listing):
    client = APIClient()
    response = client.get("/api/v1/listings/")
    assert response.status_code == 200
    assert response.data["count"] >= 1
    assert response.data["results"][0]["title"] == "Live Arena Test"

@pytest.mark.django_db
def test_categories_endpoint(sample_category):
    client = APIClient()
    response = client.get("/api/v1/categories/")
    assert response.status_code == 200
    assert len(response.data.get("results", [])) >= 1
