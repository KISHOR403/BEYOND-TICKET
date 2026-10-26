"""
Views for organizer app.
Provides dashboard metrics, listing management, order rosters, and check-in stats.
"""

from django.db.models import Count, Sum, Q
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.accounts.permissions import IsOrganizer
from apps.listings.models import Listing, OrganizationMember
from apps.listings.serializers import ListingDetailSerializer, ListingCardSerializer
from apps.orders.models import Order, Attendee
from apps.orders.serializers import OrderDetailSerializer, AttendeeSerializer
from apps.tickets.models import IssuedTicket, TicketScan


class OrganizerDashboardViewSet(viewsets.ViewSet):
    """Organizer analytics and management endpoints."""

    permission_classes = [permissions.IsAuthenticated]

    def _get_user_listing_ids(self, user):
        """Get listing IDs belonging to organizations the user is a member of or created by user."""
        org_ids = OrganizationMember.objects.filter(user=user).values_list("organization_id", flat=True)
        return Listing.objects.filter(
            Q(organization_id__in=org_ids) | Q(created_by=user)
        ).values_list("id", flat=True)

    @action(detail=False, methods=["get"])
    def metrics(self, request):
        """Aggregate stats for organizer dashboard."""
        listing_ids = self._get_user_listing_ids(request.user)

        # Orders for these listings
        confirmed_orders = Order.objects.filter(
            listing_id__in=listing_ids,
            status=Order.Status.CONFIRMED,
        )

        total_revenue = confirmed_orders.aggregate(total=Sum("total"))["total"] or 0
        total_orders = confirmed_orders.count()

        # Tickets issued & scanned
        tickets = IssuedTicket.objects.filter(order__listing_id__in=listing_ids)
        total_tickets_issued = tickets.count()
        total_tickets_used = tickets.filter(status=IssuedTicket.Status.USED).count()

        check_in_rate = (
            round((total_tickets_used / total_tickets_issued * 100), 1)
            if total_tickets_issued > 0
            else 0
        )

        active_listings_count = Listing.objects.filter(
            id__in=listing_ids,
            status=Listing.Status.PUBLISHED,
        ).count()

        # Recent 5 confirmed orders
        recent_orders = confirmed_orders.select_related("listing", "user").order_by("-created_at")[:5]
        recent_orders_data = [
            {
                "id": str(o.id),
                "order_number": o.order_number,
                "listing_title": o.listing.title,
                "customer_name": f"{o.user.first_name} {o.user.last_name}".strip() or o.user.email,
                "amount": float(o.total),
                "status": o.status,
                "created_at": o.created_at,
            }
            for o in recent_orders
        ]

        # Performance per listing
        listings = Listing.objects.filter(id__in=listing_ids).annotate(
            tickets_sold=Count("orders__tickets", filter=Q(orders__status=Order.Status.CONFIRMED)),
            revenue=Sum("orders__total", filter=Q(orders__status=Order.Status.CONFIRMED)),
        )
        listing_breakdown = [
            {
                "id": str(l.id),
                "title": l.title,
                "category": l.category.name,
                "status": l.status,
                "tickets_sold": l.tickets_sold,
                "revenue": float(l.revenue or 0),
                "start_date": l.start_date,
            }
            for l in listings
        ]

        return Response({
            "total_revenue": float(total_revenue),
            "total_orders": total_orders,
            "total_tickets_issued": total_tickets_issued,
            "total_tickets_used": total_tickets_used,
            "check_in_rate": check_in_rate,
            "active_listings_count": active_listings_count,
            "recent_orders": recent_orders_data,
            "listings": listing_breakdown,
        })

    @action(detail=False, methods=["get"])
    def listings(self, request):
        """List all listings managed by this organizer."""
        listing_ids = self._get_user_listing_ids(request.user)
        listings = Listing.objects.filter(id__in=listing_ids).order_by("-created_at")
        serializer = ListingCardSerializer(listings, many=True, context={"request": request})
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def attendees(self, request):
        """Search and list attendees across organizer's events."""
        listing_ids = self._get_user_listing_ids(request.user)
        attendees = Attendee.objects.filter(
            order__listing_id__in=listing_ids,
            order__status=Order.Status.CONFIRMED,
        ).select_related("order", "order__listing").order_by("-order__created_at")

        search = request.query_params.get("search", "")
        if search:
            attendees = attendees.filter(
                Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(email__icontains=search)
                | Q(order__order_number__icontains=search)
            )

        data = [
            {
                "id": str(a.id),
                "name": f"{a.first_name} {a.last_name}".strip(),
                "email": a.email or a.order.contact_email,
                "phone": a.phone or a.order.contact_phone,
                "order_number": a.order.order_number,
                "event_title": a.order.listing.title,
                "order_date": a.order.created_at,
            }
            for a in attendees[:100]
        ]
        return Response(data)
