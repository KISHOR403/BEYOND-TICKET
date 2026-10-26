"""
Management command to seed the database with demonstration data.
All data is clearly marked as synthetic/demo content.
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
import uuid


class Command(BaseCommand):
    help = "Seed the database with demonstration data for all 8 categories."

    def handle(self, *args, **options):
        self.stdout.write("Seeding categories...")
        self._seed_categories()
        self.stdout.write("Seeding venues...")
        self._seed_venues()
        self.stdout.write("Seeding organizations...")
        self._seed_organizations()
        self.stdout.write("Seeding listings...")
        self._seed_listings()
        self.stdout.write(self.style.SUCCESS("[SUCCESS] Seed data loaded successfully."))

    def _seed_categories(self):
        from apps.categories.models import Category

        categories = [
            {
                "name": "Concerts & Live Events",
                "slug": "concerts",
                "description": "Live music performances, concerts, and gigs",
                "icon": "music",
                "color": "#7C3AED",
                "sort_order": 1,
                "local_inventory": True,
            },
            {
                "name": "Sports Events",
                "slug": "sports",
                "description": "Cricket, football, basketball, and more",
                "icon": "trophy",
                "color": "#DC2626",
                "sort_order": 2,
                "local_inventory": True,
            },
            {
                "name": "Comedy & Theatre",
                "slug": "comedy",
                "description": "Stand-up comedy, plays, and musicals",
                "icon": "drama",
                "color": "#F59E0B",
                "sort_order": 3,
                "local_inventory": True,
            },
            {
                "name": "Activities & Attractions",
                "slug": "activities",
                "description": "Theme parks, adventures, and experiences",
                "icon": "ferris-wheel",
                "color": "#059669",
                "sort_order": 4,
                "local_inventory": True,
            },
            {
                "name": "Cultural & Local Events",
                "slug": "cultural",
                "description": "Festivals, fairs, exhibitions, and local events",
                "icon": "palette",
                "color": "#DB2777",
                "sort_order": 5,
                "local_inventory": True,
            },
            {
                "name": "Movies",
                "slug": "movies",
                "description": "Book movie tickets at cinemas near you",
                "icon": "clapperboard",
                "color": "#2563EB",
                "sort_order": 6,
                "local_inventory": False,
            },
            {
                "name": "Bus Tickets",
                "slug": "buses",
                "description": "Inter-city bus tickets and travel",
                "icon": "bus",
                "color": "#0891B2",
                "sort_order": 7,
                "local_inventory": False,
            },
            {
                "name": "Conferences & Workshops",
                "slug": "conferences",
                "description": "Tech conferences, workshops, and professional events",
                "icon": "presentation",
                "color": "#4F46E5",
                "sort_order": 8,
                "local_inventory": True,
            },
        ]
        for cat_data in categories:
            Category.objects.update_or_create(slug=cat_data["slug"], defaults=cat_data)
        self.stdout.write(f"  Created {len(categories)} categories")

    def _seed_venues(self):
        from apps.listings.models import Venue

        venues = [
            {
                "name": "Phoenix Arena",
                "address": "123 MG Road, Phoenix Mall Complex",
                "city": "Mumbai",
                "state": "Maharashtra",
                "capacity": 5000,
                "latitude": Decimal("19.0176"),
                "longitude": Decimal("72.8562"),
            },
            {
                "name": "Jawaharlal Nehru Stadium",
                "address": "Lodhi Road",
                "city": "Delhi",
                "state": "Delhi",
                "capacity": 60000,
                "latitude": Decimal("28.5815"),
                "longitude": Decimal("77.2370"),
            },
            {
                "name": "The Comedy Store",
                "address": "45 Brigade Road",
                "city": "Bengaluru",
                "state": "Karnataka",
                "capacity": 200,
                "latitude": Decimal("12.9716"),
                "longitude": Decimal("77.5946"),
            },
            {
                "name": "Wonderla Amusement Park",
                "address": "28th km, Mysore Road",
                "city": "Bengaluru",
                "state": "Karnataka",
                "capacity": 10000,
                "latitude": Decimal("12.8340"),
                "longitude": Decimal("77.4010"),
            },
            {
                "name": "Kala Ghoda Arts District",
                "address": "Kala Ghoda",
                "city": "Mumbai",
                "state": "Maharashtra",
                "capacity": 2000,
                "latitude": Decimal("18.9288"),
                "longitude": Decimal("72.8321"),
            },
            {
                "name": "HICC Convention Centre",
                "address": "Madhapur",
                "city": "Hyderabad",
                "state": "Telangana",
                "capacity": 6500,
                "latitude": Decimal("17.4526"),
                "longitude": Decimal("78.3813"),
            },
            {
                "name": "PVR INOX IMAX Palladium",
                "address": "High Street Phoenix, Lower Parel",
                "city": "Mumbai",
                "state": "Maharashtra",
                "capacity": 450,
                "latitude": Decimal("18.9950"),
                "longitude": Decimal("72.8250"),
            },
            {
                "name": "Borivali Intercity Transit Hub",
                "address": "Western Express Highway, Borivali East",
                "city": "Mumbai",
                "state": "Maharashtra",
                "capacity": 1000,
                "latitude": Decimal("19.2288"),
                "longitude": Decimal("72.8541"),
            },
        ]
        for v_data in venues:
            Venue.objects.update_or_create(name=v_data["name"], defaults=v_data)
        self.stdout.write(f"  Created {len(venues)} venues")

    def _seed_organizations(self):
        from apps.listings.models import Organization

        orgs = [
            {
                "name": "BookMyShow Events [DEMO]",
                "slug": "demo-bms-events",
                "description": "Demo event organizer — not a real entity",
                "is_verified": True,
            },
            {
                "name": "LiveNation India [DEMO]",
                "slug": "demo-livenation",
                "description": "Demo concert organizer — synthetic data only",
                "is_verified": True,
            },
            {
                "name": "Laugh Factory India [DEMO]",
                "slug": "demo-laugh-factory",
                "description": "Demo comedy venue — not affiliated with any real organization",
                "is_verified": True,
            },
            {
                "name": "TechConf India [DEMO]",
                "slug": "demo-techconf",
                "description": "Demo conference organizer — synthetic data only",
                "is_verified": True,
            },
        ]
        for org_data in orgs:
            Organization.objects.update_or_create(slug=org_data["slug"], defaults=org_data)
        self.stdout.write(f"  Created {len(orgs)} organizations")

    def _seed_listings(self):
        from apps.categories.models import Category
        from apps.listings.models import Listing, Organization, Session, Venue
        from apps.inventory.models import InventoryPool, TicketType

        now = timezone.now()
        cats = {c.slug: c for c in Category.objects.all()}
        venues = {v.name: v for v in Venue.objects.all()}
        orgs = list(Organization.objects.all())

        if not orgs:
            self.stdout.write("  No organizations found, skipping listings")
            return

        listings_data = [
            {
                "title": "Arijit Singh Live in Concert [DEMO]",
                "slug": "arijit-singh-live-demo",
                "short_description": "Experience the magic of Arijit Singh's soulful voice live",
                "description": "DEMO EVENT: This is synthetic demonstration data. Join us for an unforgettable evening with Bollywood's most beloved vocalist. This listing is for demonstration purposes only.",
                "category": cats.get("concerts"),
                "organization": orgs[1] if len(orgs) > 1 else orgs[0],
                "venue": venues.get("Phoenix Arena"),
                "start_date": now + timedelta(days=30),
                "min_price": Decimal("999"),
                "max_price": Decimal("7999"),
                "status": "published",
                "is_featured": True,
                "ticket_types": [
                    {"name": "General Admission", "price": Decimal("999"), "capacity": 3000},
                    {"name": "Gold", "price": Decimal("2499"), "capacity": 1000},
                    {"name": "VIP", "price": Decimal("4999"), "capacity": 500},
                    {"name": "VVIP", "price": Decimal("7999"), "capacity": 200},
                ],
            },
            {
                "title": "IPL 2027: Mumbai vs Chennai [DEMO]",
                "slug": "ipl-mumbai-vs-chennai-demo",
                "short_description": "The biggest rivalry in cricket returns",
                "description": "DEMO EVENT: This is synthetic demonstration data. Watch the most anticipated cricket match of the season live.",
                "category": cats.get("sports"),
                "organization": orgs[0],
                "venue": venues.get("Jawaharlal Nehru Stadium"),
                "start_date": now + timedelta(days=15),
                "min_price": Decimal("500"),
                "max_price": Decimal("15000"),
                "status": "published",
                "is_featured": True,
                "ticket_types": [
                    {"name": "East Stand", "price": Decimal("500"), "capacity": 10000},
                    {"name": "West Stand", "price": Decimal("1500"), "capacity": 8000},
                    {"name": "North Pavilion", "price": Decimal("5000"), "capacity": 3000},
                    {"name": "Corporate Box", "price": Decimal("15000"), "capacity": 500},
                ],
            },
            {
                "title": "Zakir Khan: Haq Se Single 4.0 [DEMO]",
                "slug": "zakir-khan-haq-se-single-demo",
                "short_description": "India's favorite comedian returns with a new hour",
                "description": "DEMO EVENT: Synthetic data. Zakir Khan brings his signature storytelling to the stage.",
                "category": cats.get("comedy"),
                "organization": orgs[2] if len(orgs) > 2 else orgs[0],
                "venue": venues.get("The Comedy Store"),
                "start_date": now + timedelta(days=10),
                "min_price": Decimal("499"),
                "max_price": Decimal("1999"),
                "status": "published",
                "ticket_types": [
                    {"name": "Regular", "price": Decimal("499"), "capacity": 100},
                    {"name": "Premium", "price": Decimal("999"), "capacity": 60},
                    {"name": "Front Row", "price": Decimal("1999"), "capacity": 20},
                ],
            },
            {
                "title": "Wonderla Weekend Pass [DEMO]",
                "slug": "wonderla-weekend-pass-demo",
                "short_description": "Full-day access to all rides and attractions",
                "description": "DEMO EVENT: Synthetic data. Enjoy 60+ rides including roller coasters, water rides, and more.",
                "category": cats.get("activities"),
                "organization": orgs[0],
                "venue": venues.get("Wonderla Amusement Park"),
                "start_date": now + timedelta(days=3),
                "end_date": now + timedelta(days=90),
                "min_price": Decimal("649"),
                "max_price": Decimal("1199"),
                "status": "published",
                "ticket_types": [
                    {"name": "Adult", "price": Decimal("1199"), "capacity": 5000},
                    {"name": "Child (under 12)", "price": Decimal("649"), "capacity": 3000},
                    {"name": "Family Pack (2+2)", "price": Decimal("3499"), "capacity": 1000},
                ],
            },
            {
                "title": "Kala Ghoda Arts Festival 2027 [DEMO]",
                "slug": "kala-ghoda-festival-demo",
                "short_description": "Mumbai's premier arts and culture festival",
                "description": "DEMO EVENT: Synthetic data. Nine days of art, music, dance, food, and heritage walks.",
                "category": cats.get("cultural"),
                "organization": orgs[0],
                "venue": venues.get("Kala Ghoda Arts District"),
                "start_date": now + timedelta(days=45),
                "end_date": now + timedelta(days=54),
                "min_price": Decimal("0"),
                "max_price": Decimal("999"),
                "status": "published",
                "is_featured": True,
                "ticket_types": [
                    {"name": "Day Pass", "price": Decimal("199"), "capacity": 2000},
                    {"name": "Weekend Pass", "price": Decimal("499"), "capacity": 1000},
                    {"name": "Full Festival Pass", "price": Decimal("999"), "capacity": 500},
                ],
            },
            {
                "title": "DevConf India 2027 [DEMO]",
                "slug": "devconf-india-2027-demo",
                "short_description": "India's largest developer conference",
                "description": "DEMO EVENT: Synthetic data. 3 days of talks, workshops, and networking with top engineers.",
                "category": cats.get("conferences"),
                "organization": orgs[3] if len(orgs) > 3 else orgs[0],
                "venue": venues.get("HICC Convention Centre"),
                "start_date": now + timedelta(days=60),
                "end_date": now + timedelta(days=62),
                "min_price": Decimal("1999"),
                "max_price": Decimal("9999"),
                "status": "published",
                "is_featured": True,
                "ticket_types": [
                    {"name": "Conference Pass", "price": Decimal("1999"), "capacity": 3000},
                    {"name": "Conference + Workshop", "price": Decimal("4999"), "capacity": 1000},
                    {"name": "VIP All-Access", "price": Decimal("9999"), "capacity": 200},
                ],
            },
            {
                "title": "Dune: Part Two — IMAX 70mm Special Screening [DEMO]",
                "slug": "dune-part-two-imax-demo",
                "short_description": "Experience Denis Villeneuve's sci-fi epic on India's premier IMAX screen",
                "description": "DEMO MOVIE: Synthetic demonstration data. The mythic journey of Paul Atreides as he unites with Chani and the Fremen on Arrakis. Includes luxury leather recliner and laser projection options.",
                "category": cats.get("movies"),
                "organization": orgs[0],
                "venue": venues.get("PVR INOX IMAX Palladium"),
                "start_date": now + timedelta(days=2),
                "min_price": Decimal("350"),
                "max_price": Decimal("950"),
                "status": "published",
                "is_featured": True,
                "ticket_types": [
                    {"name": "Executive Standard", "price": Decimal("350"), "capacity": 200},
                    {"name": "Club Prime", "price": Decimal("550"), "capacity": 180},
                    {"name": "VIP Recliner", "price": Decimal("950"), "capacity": 70},
                ],
            },
            {
                "title": "Mumbai to Goa Scania Multi-Axle AC Sleeper [DEMO]",
                "slug": "mumbai-goa-scania-sleeper-demo",
                "short_description": "Overnight luxury sleeper coach with GPS tracking and sanitized berths",
                "description": "DEMO BUS: Synthetic demonstration data. Direct daily overnight service from Borivali to Panaji / Mapusa with individual USB ports, Wi-Fi, and plush bedding.",
                "category": cats.get("buses"),
                "organization": orgs[0],
                "venue": venues.get("Borivali Intercity Transit Hub"),
                "start_date": now + timedelta(days=1),
                "min_price": Decimal("850"),
                "max_price": Decimal("1450"),
                "status": "published",
                "ticket_types": [
                    {"name": "Upper Berth (Single)", "price": Decimal("850"), "capacity": 15},
                    {"name": "Lower Berth (Single)", "price": Decimal("1050"), "capacity": 15},
                    {"name": "Premium Double Berth", "price": Decimal("1450"), "capacity": 10},
                ],
            },
        ]

        for listing_data in listings_data:
            ticket_types_data = listing_data.pop("ticket_types", [])
            listing, created = Listing.objects.update_or_create(
                slug=listing_data["slug"],
                defaults=listing_data,
            )
            if created:
                # Create a session for this listing
                Session.objects.create(
                    listing=listing,
                    start_time=listing.start_date or now + timedelta(days=30),
                    end_time=(listing.start_date or now + timedelta(days=30)) + timedelta(hours=3),
                    venue=listing.venue,
                )

                # Create ticket types and inventory pools
                for i, tt_data in enumerate(ticket_types_data):
                    capacity = tt_data.pop("capacity", 100)
                    tt = TicketType.objects.create(
                        listing=listing,
                        name=tt_data["name"],
                        price=tt_data["price"],
                        sort_order=i,
                    )
                    InventoryPool.objects.create(
                        ticket_type=tt,
                        total_capacity=capacity,
                    )

        self.stdout.write(f"  Created {len(listings_data)} demo listings with ticket types")
