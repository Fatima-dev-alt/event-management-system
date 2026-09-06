# Eventify - Advanced Event Management System

## Project Description
Eventify is a full-featured Event Management System built entirely with **HTML5, CSS3, and Vanilla JavaScript**. Users can browse, search, and filter events, select seats on an interactive seat map, book tickets with auto-calculated pricing, and manage their bookings. A complete Admin Panel allows staff to manage events, bookings, and customers, with dynamic dashboard statistics.

## Technologies Used
- HTML5
- CSS3 (Flexbox, Grid, CSS Variables for Light/Dark theming, Media Queries)
- Vanilla JavaScript (ES6+)
- LocalStorage (no backend required)

## User-Side Pages
1. **Event Listing (`index.html`)** — Browse all events with search, category/location/date filters, "available seats only" toggle, sorting, and pagination.
2. **Event Details (`event-details.html`)** — Full event info, an interactive seat map (available / selected / booked states), a 10-minute booking countdown timer, and a booking form with live subtotal, discount, tax, and total calculation.
3. **My Bookings (`my-bookings.html`)** — View all bookings with status filtering and the ability to cancel an active booking.

## Admin Panel
- **Dashboard** — Total Events, Bookings, Customers, Revenue, Sold Tickets, Available Seats, and Cancelled Bookings, plus a recent bookings table.
- **Events** — Add, edit, delete, search, filter, sort, and change the status of events, with seat-count safeguards against already-booked seats.
- **Bookings** — View and manage all bookings, updating their status.
- **Customers** — View customer contact details, total bookings, and total spending (auto-derived from bookings).
- **Reports** — Auto-calculated revenue and booking analytics with a printable layout.

## Key Features
- Interactive seat selection with real-time availability
- Booking countdown timer with automatic session expiry
- Custom modal, confirmation dialog, toast notifications, and loading indicator (no browser `alert()`/`confirm()`/`prompt()`)
- Light and Dark mode, saved in LocalStorage
- Keyboard shortcuts: `Ctrl+K` (search), `Esc` (close modal), `Ctrl+D` (toggle dark mode)
- Full client-side form validation with inline error messages
- Data persistence via LocalStorage (events, bookings, customers, theme)
- Fully responsive design for desktop, tablet, and mobile, with a collapsible sidebar/navbar

## How to Run the Project
1. Clone or download this repository.
2. Open `index.html` in any modern browser to use the site.
3. Open `admin/dashboard.html` to access the Admin Panel.

No build steps or dependencies are required.

## Screenshots
_Add your desktop and mobile screenshots here._

## Live Demo
_Add your GitHub Pages live demo link here._
