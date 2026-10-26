export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: "customer" | "organizer" | "checkin_staff" | "admin";
  phone?: string;
  city?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  sort_order: number;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  state?: string;
  capacity?: number;
  latitude?: number;
  longitude?: number;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  is_verified: boolean;
}

export interface Session {
  id: string;
  title: string;
  start_time: string;
  end_time?: string;
  doors_open?: string;
  venue?: Venue;
}

export interface TicketType {
  id: string;
  name: string;
  description?: string;
  price: string;
  currency: string;
  max_per_order: number;
  is_active: boolean;
  available?: number;
}

export interface Listing {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  description?: string;
  category: Category;
  organization: Organization;
  venue_name?: string;
  venue_city?: string;
  venue?: Venue;
  status: string;
  is_featured: boolean;
  start_date: string;
  end_date?: string;
  min_price: string;
  max_price?: string;
  currency: string;
  cover_image?: string;
  tags?: string[];
  cancellation_policy?: string;
  refund_policy?: string;
  age_restriction?: string;
  sessions?: Session[];
  ticket_types?: TicketType[];
}

export interface ReservationItem {
  id: string;
  ticket_type: string;
  ticket_type_name: string;
  seat?: string;
  seat_label?: string;
  quantity: number;
  unit_price: string;
  total_price: string;
}

export interface Reservation {
  id: string;
  listing: string;
  listing_title: string;
  listing_slug: string;
  session?: string;
  status: "held" | "confirmed" | "expired" | "released";
  expires_at: string;
  subtotal: string;
  platform_fee: string;
  tax: string;
  total: string;
  currency: string;
  items: ReservationItem[];
  is_expired: boolean;
  created_at: string;
}

export interface Attendee {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
}

export interface OrderItem {
  id: string;
  ticket_type: string;
  ticket_type_name: string;
  seat_label?: string;
  quantity: number;
  unit_price: string;
  total_price: string;
}

export interface Order {
  id: string;
  order_number: string;
  status: "pending" | "confirmed" | "cancelled" | "refunded";
  listing_title: string;
  listing_slug: string;
  venue_name?: string;
  venue_city?: string;
  session_start?: string;
  subtotal: string;
  platform_fee: string;
  tax: string;
  total: string;
  currency: string;
  contact_email: string;
  contact_phone?: string;
  items: OrderItem[];
  attendees: Attendee[];
  created_at: string;
}

export interface IssuedTicket {
  id: string;
  order_number: string;
  reference: string;
  token: string;
  status: "active" | "used" | "cancelled" | "expired";
  ticket_type_name: string;
  event_title: string;
  event_date?: string;
  venue_name?: string;
  seat_info?: string;
  qr_code_url?: string;
  contact_email: string;
  issued_at: string;
  used_at?: string;
}
