# Product Requirements Document (PRD)
## Clinic Management System (MVP)

| | |
|---|---|
| **Document owner** | OAH |
| **Status** | Draft v1.0 |
| **Last updated** | July 20, 2026 |
| **Target market** | Nepal (single clinic, MVP) |

> **Confirmed tech stack:** **React.js (.jsx) + TailwindCSS** on the frontend, **Node.js + Express.js (.js)** on the backend with **Socket.IO** for real-time features, and **Prisma ORM + MySQL** as the database layer, with **eSewa** and **Khalti** as the two payment gateways (the most widely integrated in Nepal for MVPs; ConnectIPS is noted as a fast-follow).

---

## 1. Overview

### 1.1 Problem Statement
Small to mid-sized clinics in Nepal largely run on paper registers, phone-based appointment booking, and manual cash handling. This causes long patient wait times, lost records, double-booked doctors, no visibility into daily revenue, and no way for patients to pay or check queue status remotely.

### 1.2 Product Vision
A web-based Clinic Management System that digitizes patient records, appointment scheduling, and billing, with **live queue/appointment status via WebSocket** so patients and staff always see up-to-date information, and **integrated Nepali digital payments** (eSewa/Khalti) so patients can pay online without cash handling at the counter.

### 1.3 Goals
- Reduce patient waiting-room uncertainty by showing live queue position and estimated wait time.
- Eliminate double-booking and manual appointment registers.
- Enable online payment collection at time of booking or checkout.
- Give clinic admins a real-time view of daily operations (patients seen, revenue, doctor load).
- Ship a usable MVP fast; defer non-essential features to Phase 2.

### 1.4 Non-Goals (Out of Scope for MVP)
- Multi-branch/multi-clinic support.
- National health insurance claims integration.
- Telemedicine / video consultation.
- Native mobile apps (MVP is responsive web only).
- Full lab information system (LIS) integration.
- ConnectIPS, bank transfer, and card payments (Phase 2).

---

## 2. Users & Personas

| Persona | Description | Key needs |
|---|---|---|
| **Admin/Owner** | Clinic owner or manager | Revenue visibility, staff/doctor management, reports |
| **Receptionist/Staff** | Front-desk operator | Fast patient check-in, booking, payment collection, queue control |
| **Doctor** | Consulting physician | View daily schedule, patient history, write prescriptions, mark visit complete |
| **Patient / Website Visitor** | End customer, often arriving via the public website with no account yet | Learn about doctors/services, self-book an appointment without calling the clinic, pay online, see live queue position, view prescription/receipt |

---

## 3. Scope Summary (MVP Feature List)

| # | Module | Priority |
|---|---|---|
| 1 | Authentication & role-based access | P0 |
| 2 | Patient management | P0 |
| 3 | Doctor management & availability | P0 |
| 4 | Public website (clinic info, doctors, services) | P0 |
| 5 | Patient self-service booking (public, no staff needed) | P0 |
| 6 | Internal appointment booking & scheduling (staff-side) | P0 |
| 7 | Real-time queue/token system (WebSocket) | P0 |
| 8 | Consultation & prescription records | P0 |
| 9 | Billing & invoicing | P0 |
| 10 | Nepali payment integration (eSewa/Khalti) | P0 |
| 11 | Admin dashboard & reports | P0 |
| 12 | Notifications (in-app real-time + booking confirmations) | P0/P1 |
| 13 | SMS/Email reminders | P2 |
| 14 | Pharmacy/inventory | P2 |
| 15 | Multi-branch support | P2 |
|16  | via webscoket real time chat with doctors  |P2|

P0 = required for MVP launch. P1 = strongly recommended. P2 = Phase 2 backlog.

---

## 4. Functional Requirements

### 4.1 Authentication & Roles
- Email/phone + password login; JWT-based session with refresh tokens.
- Roles: `Admin`, `Doctor`, `Receptionist`, `Patient`.
- Role-based route/permission guards on both frontend and API.
- Password reset via email/OTP.
- Admin can create/deactivate staff and doctor accounts.

### 4.2 Patient Management
- Register new patient: name, age/DOB, gender, phone, address, emergency contact.
- Search/filter patients by name, phone, or patient ID.
- Patient profile shows visit history, prescriptions, and invoices.
- Duplicate-patient detection by phone number during registration.

### 4.3 Doctor Management
- Doctor profile: name, specialization, qualification, consultation fee, photo.
- Define weekly working hours and slot duration per doctor.
- Doctor can mark themselves unavailable (leave/emergency) which blocks new bookings for that window.

### 4.4 Public Website
- Public marketing pages, no login required: Home, About/Clinic Info, Doctors listing, Services offered, Contact & location (with map embed), Clinic hours.
- Doctor listing page: photo, specialization, qualification, consultation fee, and a "Book Appointment" call-to-action on each doctor's profile.
- Services page describing what the clinic offers (e.g., general checkup, specific specialties), so patients know what to book for.
- Responsive design (mobile-first, since most patients will land here from a phone).
- Basic SEO: page titles/meta descriptions, clean URLs (e.g., `/doctors/dr-sharma`), so the clinic is discoverable on Google.
- Contact form / WhatsApp-style click-to-call for questions that fall outside online booking.

### 4.5 Patient Self-Service Booking (Public)
- A patient can book an appointment directly from the public website — **no staff involvement required**.
- Flow: choose doctor (or "any available doctor" / choose by service) → pick date → see live available slots → enter/confirm patient details → confirm booking.
- **Account handling:** lightweight signup — phone number + OTP verification (SMS/WhatsApp OTP) is enough to create a patient record and secure the booking; full password-based account is optional for returning patients who want to log in and manage bookings.
- Returning patients are recognized by phone number so they don't have to re-enter their details every visit.
- Same slot-availability engine as the internal booking system (section 4.6) is reused here — a slot booked from the public site instantly disappears from what staff see, and vice versa (no double-booking between public and internal booking).
- Patient can optionally pay the consultation fee online (eSewa/Khalti) at the time of public booking, or choose "pay at clinic."
- Booking confirmation shown on-screen immediately, plus SMS/email confirmation with date, time, doctor, and a reference/token number.
- Patient self-service area (reachable via a link sent in the confirmation, or by logging in with phone+OTP): view upcoming appointments, reschedule or cancel (subject to a cancellation-window rule, e.g., no changes within 2 hours of the slot), view past visit history, download past prescriptions/receipts.
- Once the appointment day arrives, this same public flow feeds into the real-time queue system (section 4.7) — the patient can open a link to see their live token/queue position without needing the staff-side app.

### 4.6 Internal Appointment Booking & Scheduling (Staff-Side)
- Staff selects doctor → date → available slot on behalf of a patient (walk-in or phone booking).
- System prevents double-booking a slot; shows only open slots — shared in real time with the public booking flow in 4.5.
- Appointment statuses: `Booked` → `Checked-in` → `In-progress` → `Completed` / `Cancelled` / `No-show`.
- Reschedule/cancel with reason capture.
- Walk-in patients can be added directly to the queue without a pre-booked slot.

### 4.7 Real-Time Queue & Token System (WebSocket)
- On check-in, patient is assigned a token number per doctor per day.
- A public "queue display" screen (for the waiting room) shows current token being served and next 3 in line, updated live via WebSocket — no manual refresh.
- Patient-facing view (mobile web, reachable from the public site/confirmation link) shows their token, position in line, and live estimated wait time.
- Doctor's screen has a "Call Next Patient" action that broadcasts the update instantly to the queue display and patient's phone.
- Reconnect/resync logic: if a client's WebSocket drops, it re-fetches current state via REST on reconnect to avoid stale data.

### 4.8 Consultation & Prescription
- Doctor opens patient record during visit; views history and adds new consultation notes.
- Structured prescription entry (drug name, dosage, duration, instructions) with a free-text notes field.
- Mark visit as `Completed`, which triggers invoice generation.
- Downloadable/printable prescription (PDF).

### 4.9 Billing & Invoicing
- Auto-generate itemized invoice on visit completion (consultation fee + any manually added items like tests).
- Invoice statuses: `Pending`, `Paid`, `Partially Paid`, `Refunded`.
- Support both online payment and cash/POS-at-counter as payment methods on the same invoice.
- Printable/downloadable receipt (PDF) after payment.

### 4.10 Nepali Payment Integration (eSewa / Khalti)
- At public booking, internal booking, or at checkout, patient chooses "Pay Online" → redirected to eSewa or Khalti checkout.
- Backend initiates a payment session with the gateway (amount, invoice/booking reference, success/failure callback URLs).
- Gateway calls back a webhook/verification endpoint; backend independently verifies the transaction status with the gateway's verification API (never trust the redirect params alone) before marking the invoice `Paid` or confirming the booking as paid.
- On successful verification, invoice status updates and a real-time WebSocket event notifies staff/admin dashboard instantly ("Payment received for Invoice #123").
- Failed/cancelled payments return the patient to a retry screen; invoice/booking stays `Pending` (unpaid bookings can still be honored as "pay at clinic" depending on clinic policy).
- Basic manual refund flow: admin marks an invoice `Refunded` with a reason (actual gateway refund API integration can be Phase 2 depending on eSewa/Khalti merchant capabilities).
- All transactions logged with gateway reference ID for reconciliation.

### 4.11 Admin Dashboard & Reports
- Daily snapshot: appointments booked (split by public-website vs. staff-entered), patients seen, revenue collected (cash vs. online), no-show count.
- Doctor-wise load report (patients seen per doctor per day/week).
- Date-range revenue report, exportable as CSV.
- Real-time counters on the dashboard update via WebSocket as events happen (new booking, check-in, payment) — including bookings coming in live from the public website.

### 4.12 Notifications (In-App Real-Time + Booking Confirmations)
- Receptionist gets a live alert when a patient books online (public website), checks in, or completes payment.
- Doctor gets a live alert when their next patient is ready.
- Toast/badge notifications delivered over the same WebSocket connection used for queue updates.
- Patient receives an SMS/email/on-screen confirmation immediately after a successful public booking (and again on payment success).

---

## 5. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Performance** | Queue/dashboard WebSocket updates delivered within ~1 second of the triggering event. |
| **Availability** | Target 99% uptime during clinic hours; graceful degradation to REST polling if WebSocket connection fails. |
| **Security** | HTTPS everywhere; passwords hashed (bcrypt/argon2); role-based access control enforced server-side; payment callbacks verified server-to-server, not trusted from client redirect. |
| **Data privacy** | Patient medical data access logged; only authorized roles can view full medical history (basic audit trail for MVP). |
| **Scalability** | Single-clinic load initially (tens of concurrent users); architecture should allow horizontal scaling of WebSocket layer later (e.g., Redis adapter for Socket.IO) without a rewrite. |
| **Localization** | UI in English with Nepali labels where useful (e.g., payment method names); currency in NPR. |
| **Browser support** | Modern evergreen browsers on desktop and mobile web. |
| **Backup** | Daily automated database backup. |

---

## 6. Proposed Technical Architecture

```
┌────────────────┐        REST + WebSocket        ┌───────────────────────┐
│   Frontend      │ ─────────────────────────────▶ │   Backend (Express.js)│
│  React.js (.jsx)│ ◀───────────────────────────── │   + Socket.IO server    │
│  + TailwindCSS  │                                 │                        │
│  (staff, doctor,│                                 │  - Auth (JWT)          │
│   patient, and  │                                 │  - Appointment engine  │
│   public queue   │                                 │  - Queue engine        │
│   display views)│                                 │  - Billing engine      │
└────────────────┘                                 │  - Payment service     │
                                                     └─────────┬──────────────┘
                                                               │
                                        ┌──────────────────────┼───────────────────────┐
                                        ▼                      ▼                       ▼
                               ┌────────────────┐   ┌────────────────────┐   ┌──────────────────┐
                               │  MySQL          │   │  eSewa / Khalti     │   │  PDF generator     │
                               │  (via Prisma)   │   │  Payment Gateway    │   │  (invoices,        │
                               │  patients,      │   │  APIs               │   │  prescriptions)    │
                               │  appointments,  │   └────────────────────┘   └──────────────────┘
                               │  invoices, etc. │
                               └────────────────┘
```

### 6.1 Confirmed Stack
- **Frontend:** React.js (`.jsx`, via Vite or Create React App — no Next.js/SSR needed for MVP), TailwindCSS, Socket.IO client, React Router for navigation, Axios/Fetch for REST calls.
- **Backend:** Node.js + Express.js (`.js`, plain JavaScript, no TypeScript), Socket.IO server, `express-validator` or `zod` for request validation.
- **Database:** MySQL, accessed via **Prisma ORM** (`schema.prisma` models mapped to MySQL tables; Prisma Migrate for schema migrations).
- **Auth:** JWT + refresh tokens, bcrypt for password hashing, `jsonwebtoken` + `cookie-parser`/httpOnly cookies.
- **Payments:** eSewa ePay v2 API, Khalti Payment Gateway API (both offer sandbox/test credentials for development).
- **PDF generation:** e.g., Puppeteer or pdf-lib for invoices/prescriptions.
- **Hosting:** Any VPS/cloud (e.g., a Nepal-friendly or regional host) with a managed MySQL instance; app server and database co-located to minimize latency.

### 6.2 Core Database Entities (simplified)
- `User` (id, name, email, phone, password_hash, role)
- `Patient` (id, name, dob, gender, phone, address, created_by, source `[web | staff]`)
- `OtpVerification` (id, phone, otp_code_hash, purpose, expires_at, verified_at) — used for public-site phone verification during self-booking/login
- `Doctor` (id, user_id, specialization, consultation_fee, working_hours JSON)
- `Service` (id, name, description, shown_on_website) — powers the public Services page and lets patients book "by service" instead of by doctor
- `Appointment` (id, patient_id, doctor_id, service_id, scheduled_at, status, token_number, source `[public_website | staff]`, created_at)
- `Consultation` (id, appointment_id, notes, diagnosis, created_at)
- `Prescription` (id, consultation_id, drug_name, dosage, duration, instructions)
- `Invoice` (id, appointment_id, patient_id, amount, status, payment_method)
- `Payment` (id, invoice_id, gateway, gateway_txn_id, status, amount, verified_at)
- `QueueState` (doctor_id, current_token, date) — or derived in real time from `Appointment` rows.

> The `source` field on `Patient`/`Appointment` is what lets the admin dashboard report "booked via public website" vs. "booked by staff" (see 4.11), and is also useful later for marketing/analytics on how patients are actually finding and using the clinic.

### 6.3 Key WebSocket Events (example contract)

| Event | Direction | Payload | Purpose |
|---|---|---|---|
| `queue:update` | server → clients | `{ doctorId, currentToken, nextTokens[] }` | Refresh queue display/patient view |
| `appointment:statusChanged` | server → clients | `{ appointmentId, status }` | Reflect check-in/in-progress/completed |
| `appointment:slotsChanged` | server → public site + staff app | `{ doctorId, date, availableSlots[] }` | Keep public-website and staff booking calendars in sync in real time so neither can double-book |
| `booking:created` | server → staff/admin | `{ appointmentId, patientName, doctorId, source }` | Live "new booking" alert when a patient books from the public website |
| `payment:received` | server → staff/admin | `{ invoiceId, amount, method }` | Live billing/dashboard notification |
| `doctor:availabilityChanged` | server → clients | `{ doctorId, available }` | Reflect doctor going unavailable |
| `dashboard:metricsUpdate` | server → admin | `{ appointmentsToday, revenueToday }` | Live admin counters |

### 6.4 Key REST Endpoints (example, non-exhaustive)

**Public website / patient-facing (no staff login required):**
- `GET /public/doctors`, `GET /public/doctors/:id`, `GET /public/services`
- `POST /public/otp/request`, `POST /public/otp/verify` (phone-based verification for booking/login)
- `GET /public/availability?doctorId=&date=` → live open slots
- `POST /public/appointments` → creates patient (if new) + appointment, emits `appointment:slotsChanged` and `booking:created`
- `GET /public/appointments/:id` (with a secure token/link) → booking confirmation & live queue position
- `PATCH /public/appointments/:id/reschedule`, `PATCH /public/appointments/:id/cancel`
- `POST /public/appointments/:id/pay/esewa`, `POST /public/appointments/:id/pay/khalti`

**Staff/admin (authenticated):**
- `POST /auth/login`, `POST /auth/refresh`
- `GET/POST /patients`, `GET /patients/:id`
- `GET/POST /doctors`, `PATCH /doctors/:id/availability`
- `GET/POST /appointments`, `PATCH /appointments/:id/status`
- `POST /appointments/:id/checkin` → assigns token, emits `queue:update`
- `POST /invoices/:id/pay/esewa`, `POST /invoices/:id/pay/khalti`
- `POST /payments/esewa/callback`, `POST /payments/khalti/callback` (server-to-server verification)
- `GET /reports/daily-summary`, `GET /reports/revenue?from=&to=`

---

## 7. Payment Flow Detail (eSewa / Khalti)

1. Patient/staff selects "Pay Online" on an invoice.
2. Backend creates a `Payment` record (`status: initiated`) and requests a payment session/token from eSewa or Khalti.
3. Patient is redirected to the gateway's hosted checkout page.
4. After payment, the gateway redirects back to a success/failure URL **and** independently calls (or is polled via) the gateway's verification endpoint.
5. Backend verifies the transaction amount and reference server-side before trusting it — this step is critical to prevent spoofed "success" redirects.
6. On verified success: `Payment.status = verified`, `Invoice.status = Paid`, emit `payment:received` over WebSocket, generate receipt.
7. On failure/timeout: `Payment.status = failed`, invoice remains payable, patient can retry.

---

## 8. Success Metrics (MVP)

| Metric | Target (first 3 months post-launch) |
|---|---|
| % of appointments booked online vs. phone/walk-in | Track baseline, aim for 30%+ online |
| Average patient wait time (perceived, via queue system) | Reduce vs. pre-launch baseline |
| % of invoices paid online (eSewa/Khalti) | 20%+ of eligible transactions |
| System uptime during clinic hours | ≥ 99% |
| Staff time spent on manual registers | Measurable reduction (qualitative feedback) |

---

## 9. Milestones (Suggested)

| Phase | Scope | Rough duration |
|---|---|---|
| **M1 – Foundation** | Auth, roles, patient CRUD, doctor CRUD | 1–2 weeks |
| **M2 – Scheduling** | Internal appointment booking, availability logic (shared engine used by both staff and public site) | 1–2 weeks |
| **M3 – Public website & self-booking** | Marketing pages (home/doctors/services/contact), OTP-based patient booking flow, booking confirmations | 1–2 weeks |
| **M4 – Real-time queue** | WebSocket queue engine, queue display screen, patient live view (accessible from booking confirmation link) | 1–2 weeks |
| **M5 – Billing & payments** | Invoicing, eSewa + Khalti integration (both internal checkout and public-site booking checkout), receipts | 2 weeks |
| **M6 – Dashboard & polish** | Admin dashboard, reports (incl. public vs. staff booking split), notifications, QA | 1–2 weeks |
| **M7 – Pilot launch** | Deploy at one clinic, gather feedback | ongoing |

*(Timeline assumes a small team of 1–3 developers; adjust to your actual team size.)*

---

## 10. Risks & Open Questions

- **Payment gateway approval time** — eSewa/Khalti merchant onboarding (KYC, business registration) can take time; start this in parallel with development, not after.
- **WebSocket scaling** — fine for a single clinic; if multi-branch is added later, will need a Redis adapter (or similar) for Socket.IO to scale across multiple server instances.
- **Connectivity reliability** — clinic Wi-Fi/internet outages could disrupt live queue updates; needs a REST-polling fallback so the system still works offline-ish.
- **Public booking abuse/spam** — since anyone on the internet can hit the public booking form, add basic protections: rate-limit OTP requests per phone/IP, CAPTCHA on the booking form, and a cap on how many future slots a single unverified phone number can hold at once.
- **No-shows on free (unpaid) public bookings** — patients who book without paying online have lower commitment; consider a no-show policy (e.g., flag repeat no-show phone numbers, or nudge patients toward paying online at booking time).
- **SMS/OTP delivery cost & reliability** — OTP and confirmation SMS in Nepal typically go through a local SMS gateway/aggregator; this is a real per-message cost and a new external dependency to account for in the budget and architecture (separate from the payment gateways).
- **Open question:** Is a single clinic location confirmed for MVP, or should multi-branch be designed for from day one (affects data model)?
- **Open question:** Which specific Nepali payment gateway(s) do you already have merchant accounts with — eSewa, Khalti, or both?
- **Open question:** For public bookings, should online payment be mandatory to hold the slot, optional, or only required for certain doctors/services?
- **Open question:** Which SMS gateway/aggregator (if any) do you plan to use for OTP and booking confirmations in Nepal?

---

## 11. Appendix: Full MVP Feature Checklist

- [ ] Role-based login (Admin/Doctor/Receptionist/Patient)
- [ ] Patient registration & search
- [ ] Doctor profile & availability management
- [ ] **Public website: Home, About, Doctors listing, Services, Contact/location**
- [ ] **Public patient self-booking flow (choose doctor/service → date → slot → confirm)**
- [ ] **Phone + OTP verification for public booking/login**
- [ ] **Public patient self-service area (view/reschedule/cancel own bookings, past prescriptions/receipts)**
- [ ] Internal (staff-side) appointment booking, reschedule, cancel
- [ ] Shared real-time slot availability between public site and staff app (no double-booking)
- [ ] Walk-in check-in
- [ ] Real-time token/queue system (WebSocket)
- [ ] Public queue display screen
- [ ] Patient live queue view (from booking confirmation link)
- [ ] Consultation notes & prescription entry
- [ ] PDF prescription/receipt generation
- [ ] Invoice generation & status tracking
- [ ] eSewa payment integration (internal + public booking checkout)
- [ ] Khalti payment integration (internal + public booking checkout)
- [ ] Server-side payment verification
- [ ] Real-time payment/booking notifications (incl. live "new public booking" alerts)
- [ ] SMS/email booking confirmations
- [ ] Admin dashboard with live metrics (public vs. staff bookings)
- [ ] Revenue/doctor-load reports (CSV export)
