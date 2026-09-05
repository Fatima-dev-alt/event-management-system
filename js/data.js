/* =========================================================
   DATA LAYER
   Seed events + LocalStorage helpers for events, bookings,
   customers, and theme. Loaded FIRST on every page.
   ========================================================= */

const STORAGE_KEYS = {
  EVENTS: "evt_events",
  BOOKINGS: "evt_bookings",
  CUSTOMERS: "evt_customers",
  THEME: "evt_theme"
};

const SEED_EVENTS = [
  {
    id: "EVT001",
    name: "Neon Nights Music Festival",
    category: "Music",
    date: "2026-09-20",
    time: "19:00",
    location: "Riverside Arena, Lahore",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=700&q=80&auto=format&fit=crop",
    description: "An electrifying night of live performances from top regional artists across pop, rock, and electronic music, with stunning stage visuals and food trucks on site.",
    price: 45,
    rows: 6,
    seatsPerRow: 8,
    status: "Upcoming"
  },
  {
    id: "EVT002",
    name: "TechForward Summit 2026",
    category: "Technology",
    date: "2026-09-25",
    time: "09:30",
    location: "Convention Center, Karachi",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=700&q=80&auto=format&fit=crop",
    description: "A full-day summit featuring keynote speakers from leading tech companies, hands-on workshops, and networking sessions for developers and founders.",
    price: 60,
    rows: 8,
    seatsPerRow: 10,
    status: "Upcoming"
  },
  {
    id: "EVT003",
    name: "Startup Growth Conference",
    category: "Business",
    date: "2026-09-12",
    time: "10:00",
    location: "Business Hub, Islamabad",
    image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=700&q=80&auto=format&fit=crop",
    description: "Learn growth strategies from successful founders and investors, with panel discussions on fundraising, marketing, and scaling operations.",
    price: 35,
    rows: 5,
    seatsPerRow: 8,
    status: "Ongoing"
  },
  {
    id: "EVT004",
    name: "City Marathon 2026",
    category: "Sports",
    date: "2026-10-05",
    time: "06:00",
    location: "Central Park, Lahore",
    image: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=700&q=80&auto=format&fit=crop",
    description: "Join thousands of runners in the annual city marathon with 5K, 10K, and full marathon categories. Includes finisher medals and refreshment stations.",
    price: 20,
    rows: 4,
    seatsPerRow: 10,
    status: "Upcoming"
  },
  {
    id: "EVT005",
    name: "Modern Art Exhibition",
    category: "Arts",
    date: "2026-08-30",
    time: "11:00",
    location: "National Gallery, Lahore",
    image: "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=700&q=80&auto=format&fit=crop",
    description: "A curated exhibition showcasing contemporary art from emerging local and international artists, spanning painting, sculpture, and digital media.",
    price: 15,
    rows: 5,
    seatsPerRow: 6,
    status: "Completed"
  },
  {
    id: "EVT006",
    name: "Street Food Carnival",
    category: "Food",
    date: "2026-09-18",
    time: "16:00",
    location: "Food Street, Karachi",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=700&q=80&auto=format&fit=crop",
    description: "A weekend-long celebration of local and international street food, live cooking demos, and live music performances for the whole family.",
    price: 10,
    rows: 6,
    seatsPerRow: 8,
    status: "Upcoming"
  },
  {
    id: "EVT007",
    name: "Jazz & Blues Evening",
    category: "Music",
    date: "2026-09-08",
    time: "20:00",
    location: "The Loft, Islamabad",
    image: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=700&q=80&auto=format&fit=crop",
    description: "An intimate evening of live jazz and blues performances by acclaimed local musicians in a cozy, atmospheric venue.",
    price: 25,
    rows: 4,
    seatsPerRow: 6,
    status: "Cancelled"
  },
  {
    id: "EVT008",
    name: "AI & Robotics Expo",
    category: "Technology",
    date: "2026-10-15",
    time: "10:00",
    location: "Expo Center, Lahore",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=700&q=80&auto=format&fit=crop",
    description: "Explore the latest innovations in artificial intelligence and robotics with live demos, exhibitor booths, and expert-led talks.",
    price: 50,
    rows: 7,
    seatsPerRow: 10,
    status: "Upcoming"
  },
  {
    id: "EVT009",
    name: "Champions Football Cup",
    category: "Sports",
    date: "2026-09-14",
    time: "18:30",
    location: "National Stadium, Karachi",
    image: "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=700&q=80&auto=format&fit=crop",
    description: "Watch the region's top football clubs compete in this high-energy championship match, with pre-game entertainment and fan zones.",
    price: 30,
    rows: 8,
    seatsPerRow: 12,
    status: "Ongoing"
  },
  {
    id: "EVT010",
    name: "Photography Masterclass",
    category: "Arts",
    date: "2026-09-28",
    time: "14:00",
    location: "Creative Studio, Islamabad",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=700&q=80&auto=format&fit=crop",
    description: "A hands-on workshop covering composition, lighting, and editing techniques, led by an award-winning professional photographer.",
    price: 40,
    rows: 3,
    seatsPerRow: 6,
    status: "Upcoming"
  },
  {
    id: "EVT011",
    name: "Comedy Night Live",
    category: "Music",
    date: "2026-09-22",
    time: "21:00",
    location: "The Basement, Lahore",
    image: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=700&q=80&auto=format&fit=crop",
    description: "A night of stand-up comedy featuring some of the funniest rising comedians in the region. Doors open 30 minutes before showtime.",
    price: 18,
    rows: 5,
    seatsPerRow: 8,
    status: "Upcoming"
  },
  {
    id: "EVT012",
    name: "Entrepreneurship Bootcamp",
    category: "Business",
    date: "2026-08-25",
    time: "09:00",
    location: "Innovation Hub, Karachi",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=700&q=80&auto=format&fit=crop",
    description: "A two-day intensive bootcamp covering business planning, pitching, and early-stage fundraising for aspiring entrepreneurs.",
    price: 55,
    rows: 5,
    seatsPerRow: 8,
    status: "Completed"
  }
];

const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23e2e8f0'/%3E%3Cpath d='M60 72h80v68a8 8 0 0 1-8 8H68a8 8 0 0 1-8-8V72z' fill='none' stroke='%2394a3b8' stroke-width='6'/%3E%3Cpath d='M70 72V56a30 30 0 0 1 60 0v16' fill='none' stroke='%2394a3b8' stroke-width='6'/%3E%3Ccircle cx='85' cy='95' r='6' fill='%2394a3b8'/%3E%3Cpath d='M60 130l30-25 20 16 20-14 30 27' fill='none' stroke='%2394a3b8' stroke-width='6'/%3E%3C/svg%3E";

function handleImgError(img) {
  img.onerror = null;
  img.src = FALLBACK_IMAGE;
}

/* ---------- INIT ---------- */
function initEventsData() {
  if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(SEED_EVENTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify([]));
  }
}

/* ---------- GENERIC HELPERS ---------- */
function generateId(prefix) {
  return prefix + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 900 + 100);
}

function formatCurrency(amount) {
  return "$" + Number(amount).toFixed(2);
}

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function formatDateTime(isoStr) {
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return isoStr;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) +
    " " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

/* ---------- EVENTS ---------- */
function getEvents() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS)) || [];
  } catch (e) {
    return [];
  }
}

function saveEvents(events) {
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
}

function getEventById(id) {
  return getEvents().find(e => e.id === id);
}

function addEvent(eventData) {
  const events = getEvents();
  const newEvent = Object.assign({ id: generateId("EVT") }, eventData);
  events.push(newEvent);
  saveEvents(events);
  return newEvent;
}

function updateEvent(id, updates) {
  const events = getEvents();
  const idx = events.findIndex(e => e.id === id);
  if (idx === -1) return null;
  events[idx] = Object.assign({}, events[idx], updates);
  saveEvents(events);
  return events[idx];
}

function deleteEvent(id) {
  const events = getEvents().filter(e => e.id !== id);
  saveEvents(events);
  const bookings = getBookings().filter(b => b.eventId !== id);
  saveBookings(bookings);
  rebuildCustomersFromBookings();
}

function getTotalSeats(event) {
  return event.rows * event.seatsPerRow;
}

function getBookedSeats(eventId) {
  return getBookings()
    .filter(b => b.eventId === eventId && b.status !== "Cancelled")
    .flatMap(b => b.seats);
}

function getAvailableSeatsCount(event) {
  return getTotalSeats(event) - getBookedSeats(event.id).length;
}

/* ---------- BOOKINGS ---------- */
function getBookings() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS)) || [];
  } catch (e) {
    return [];
  }
}

function saveBookings(bookings) {
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
}

function getBookingById(id) {
  return getBookings().find(b => b.id === id);
}

function addBooking(bookingData) {
  const bookings = getBookings();
  const newBooking = Object.assign(
    { id: generateId("BKG"), status: "Confirmed", bookingDate: new Date().toISOString() },
    bookingData
  );
  bookings.push(newBooking);
  saveBookings(bookings);
  rebuildCustomersFromBookings();
  return newBooking;
}

function updateBookingStatus(id, status) {
  const bookings = getBookings();
  const idx = bookings.findIndex(b => b.id === id);
  if (idx === -1) return null;
  bookings[idx].status = status;
  saveBookings(bookings);
  rebuildCustomersFromBookings();
  return bookings[idx];
}

/* ---------- CUSTOMERS (rebuilt from bookings every time bookings change) ---------- */
function getCustomers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) || [];
  } catch (e) {
    return [];
  }
}

function saveCustomers(customers) {
  localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
}

function rebuildCustomersFromBookings() {
  const bookings = getBookings();
  const map = {};

  bookings.forEach(b => {
    if (b.status === "Cancelled") return;
    const key = b.email.toLowerCase();
    if (!map[key]) {
      map[key] = {
        name: b.fullName,
        email: b.email,
        phone: b.phone,
        totalBookings: 0,
        totalSpending: 0,
        lastBooking: b.bookingDate
      };
    }
    map[key].totalBookings += 1;
    map[key].totalSpending += b.totalAmount;
    if (new Date(b.bookingDate) > new Date(map[key].lastBooking)) {
      map[key].lastBooking = b.bookingDate;
    }
  });

  saveCustomers(Object.values(map));
}
