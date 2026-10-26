"""
Ticket issuance service.
Generates unique digital tickets with cryptographically secure tokens and real QR codes.
"""

from io import BytesIO
import qrcode
from django.core.files.base import ContentFile
from django.utils import timezone
from .models import IssuedTicket


def issue_tickets_for_order(order):
    """
    Issues digital tickets for all items in a confirmed order.
    Generates QR codes encoding the ticket's verification URL / secure token.
    """
    issued_tickets = []
    listing = order.listing
    venue = listing.venue
    session = order.session

    event_date = session.start_time if session else listing.start_date
    venue_name = venue.name if venue else ""

    for item in order.items.select_related("ticket_type", "seat").all():
        for i in range(item.quantity):
            seat_info = ""
            if item.seat:
                sec = f"{item.seat.section} " if item.seat.section else ""
                row = f"Row {item.seat.row} " if item.seat.row else ""
                seat_info = f"{sec}{row}Seat {item.seat.seat_number}".strip()

            ticket = IssuedTicket(
                order=order,
                order_item=item,
                ticket_type=item.ticket_type,
                seat=item.seat,
                event_title=listing.title,
                event_date=event_date,
                venue_name=venue_name,
                seat_info=seat_info,
                status=IssuedTicket.Status.ACTIVE,
            )
            # Reference and token are generated on save or default
            ticket.save()

            # Generate real QR code image
            qr_data = f"BT-VERIFY:{ticket.token}"
            qr_img = qrcode.make(qr_data)
            buffer = BytesIO()
            qr_img.save(buffer, format="PNG")
            buffer.seek(0)

            filename = f"qr_{ticket.reference}_{ticket.token[:8]}.png"
            ticket.qr_code.save(filename, ContentFile(buffer.getvalue()), save=True)
            issued_tickets.append(ticket)

    return issued_tickets
