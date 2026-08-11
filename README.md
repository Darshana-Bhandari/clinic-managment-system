# 🏥 Clinic Management Syste

A modern web-based **Clinic Management System** designed to help manage clinic operations through a user-friendly digital platform.

The project includes a feature-rich **React frontend** with public clinic pages, appointment booking interfaces, role-based dashboard layouts, reusable components, responsive design, and light/dark theme support. A **Node.js and Express backend** has also been initialized and is currently being developed.

> 🚧 **Project Status: In Progress**
>
> The frontend interface is substantially developed, but most data currently comes from static mock data. The backend is in its early development stage and is not yet connected to a database or the frontend.

---

## 📌 Project Overview

Many small clinics still depend on paper records, manual appointment registers, and phone-based booking systems. These processes can lead to:

* Long patient waiting times
* Appointment conflicts or double-booking
* Difficulty managing patient information
* Limited visibility into daily clinic activities
* Manual billing and reporting

This project aims to provide a centralized digital system for managing important clinic operations, including:

* Patient information
* Doctor information
* Appointment booking
* Clinic services
* Staff operations
* Patient records
* Billing
* Queue management
* Administrative reports

---

## ✨ Current Features

### 🌐 Public Clinic Website

The frontend currently includes:

* Responsive home page
* Clinic hero section
* Doctor listing page
* Doctor detail pages
* Service information
* About page
* Contact page
* Appointment booking interface
* Search and filtering interfaces
* Reusable navigation and footer components

### 👨‍⚕️ Doctor Features

* Doctor listing
* Doctor cards
* Doctor details
* Doctor search interface
* Doctor filtering interface
* Reusable doctor-related components
* Static doctor data for frontend development

### 🧑‍💼 Admin Dashboard

The admin interface currently includes:

* Admin overview dashboard
* Doctor management interface
* Reports page
* Settings page
* Dashboard statistics
* Charts and data visualizations
* Reusable dashboard components

### 🧾 Staff Dashboard

The staff interface currently includes:

* Staff overview
* Patient management interface
* Appointment management
* Queue management
* Billing interface
* Dashboard navigation and layouts

### 🧑 Patient Dashboard

The patient interface currently includes:

* Appointment information
* Appointment history
* Patient dashboard layout
* Patient-focused navigation

### 🎨 User Interface

* Responsive design
* Light and dark theme support
* Reusable UI components
* Reusable cards and buttons
* Modal component
* Toast notification component
* Loading spinner
* Input components
* Status badges and pills
* Custom doctor selection component
* Navigation sidebar
* Dashboard layouts
* Charts and statistics components
* Icons using Lucide React

---

## 🛠️ Technology Stack

| Category              | Technology          | Current Status          |
| --------------------- | ------------------- | ----------------------- |
| Frontend              | React 19            | ✅ In development        |
| Build Tool            | Vite                | ✅ Configured            |
| Styling               | CSS                 | ✅ Implemented           |
| Routing               | React Router DOM    | ✅ Implemented           |
| Icons                 | Lucide React        | ✅ Implemented           |
| Backend               | Node.js             | 🚧 Started              |
| Backend Framework     | Express 5           | 🚧 Basic server created |
| Environment Variables | dotenv              | ✅ Configured            |
| Development Tool      | Nodemon             | ✅ Configured            |
| Database              | Not connected yet   | ⏳ Planned               |
| Authentication        | Not implemented yet | ⏳ Planned               |
| Real-Time Features    | Not implemented yet | ⏳ Planned               |
| Payment Integration   | Not implemented yet | ⏳ Planned               |

---

## 📁 Project Structure

```text
clinic-managment-system/
│
├── Frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   │
│   ├── src/
│   │   ├── assets/
│   │   │
│   │   ├── components/
│   │   │   ├── doctors/
│   │   │   ├── HomepageComponent/
│   │   │   ├── layout/
│   │   │   ├── sections/
│   │   │   └── ui/
│   │   │
│   │   ├── config/
│   │   │
│   │   ├── contexts/
│   │   │   ├── DoctorContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useClickOutside.js
│   │   │   ├── useDebounce.js
│   │   │   ├── useMediaQuery.js
│   │   │   └── useStorage.js
│   │   │
│   │   ├── pages/
│   │   │   ├── dashboard/
│   │   │   │   ├── admin/
│   │   │   │   ├── patient/
│   │   │   │   └── staff/
│   │   │   │
│   │   │   ├── About.jsx
│   │   │   ├── Booking.jsx
│   │   │   └── Contact.jsx
│   │   │
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── .env
│   │   └── server.js
│   │
│   ├── learning.md
│   ├── package.json
│   └── package-lock.json
│
├── projectoutline.md
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure the following software is installed:

* Node.js version 18 or later
* npm
* Git

---

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/Darshana-Bhandari/clinic-managment-system.git
```

Move into the project folder:

```bash
cd clinic-managment-system
```

---

## 2️⃣ Run the Frontend

Open a terminal in the project folder and run:

```bash
cd Frontend
```

Install the frontend dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite will display a local URL similar to:

```text
http://localhost:5173
```

Open the displayed URL in your browser.

> If port `5173` is already in use, Vite may automatically use another port, such as `5174`.

---

## 3️⃣ Run the Backend

Open a **new terminal** and move to the backend folder:

```bash
cd backend
```

Install the backend dependencies:

```bash
npm install
```

Start the backend development server:

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:3000
```

---

## 🔌 Current Backend Routes

The backend currently contains basic Express routes created while learning and practicing:

| Method   | Route                     | Description                            |
| -------- | ------------------------- | -------------------------------------- |
| `GET`    | `/`                       | Returns a welcome message              |
| `GET`    | `/about`                  | Returns an About page message          |
| `GET`    | `/student`                | Returns example student data           |
| `GET`    | `/employee`               | Returns example employee data          |
| `POST`   | `/create`                 | Example POST route                     |
| `PUT`    | `/appointment/:id`        | Example appointment update route       |
| `DELETE` | `/appointment/:id`        | Example appointment delete route       |
| `GET`    | `/doctors/:id`            | Demonstrates route parameters          |
| `GET`    | `/appointments/:id/:name` | Demonstrates multiple route parameters |
| `GET`    | `/doctors`                | Demonstrates query parameters          |

> ⚠️ These routes are currently used for learning and testing Express. They are not yet connected to the clinic frontend, a database, or real clinic data.

---

## 🧩 Frontend Components

The project uses reusable components to keep the code organized and maintainable.

### UI Components

* Button
* Card
* Badge
* Modal
* Toast
* Input
* Loading Spinner
* Carousel
* Social Icons
* Brand Icons
* Custom Doctor Select

### Layout Components

* Main Layout
* Navbar
* Footer
* Sidebar
* Admin Layout
* Staff Layout
* Patient Layout
* Authentication Layout
* Dashboard Top Bar

### Dashboard Components

* Section Card
* Statistics Card
* Area Chart
* Donut Chart
* Bar List
* Status Pill

---

## 🧠 Custom React Hooks

The frontend currently includes reusable custom hooks:

* `useClickOutside` — Detects clicks outside an element
* `useDebounce` — Delays repeated operations such as search input
* `useMediaQuery` — Helps create responsive behavior
* `useStorage` — Simplifies browser storage management

---

## 🌙 Theme Support

The application includes light and dark theme functionality through React Context.

The theme system is managed using:

```text
ThemeContext.jsx
```

Theme preferences can be stored and reused through browser storage.

---

## 📊 Current Development Status

| Feature                     | Status               |
| --------------------------- | -------------------- |
| Public clinic website       | ✅ Developed          |
| Home page                   | ✅ Developed          |
| Doctor listing              | ✅ Developed          |
| Doctor details              | ✅ Developed          |
| Clinic services             | ✅ Developed          |
| About page                  | ✅ Developed          |
| Contact page                | ✅ Developed          |
| Appointment booking UI      | ✅ Developed          |
| Admin dashboard UI          | ✅ Developed          |
| Staff dashboard UI          | ✅ Developed          |
| Patient dashboard UI        | ✅ Developed          |
| Reusable React components   | ✅ Developed          |
| Responsive interface        | ✅ Implemented        |
| Light/dark theme            | ✅ Implemented        |
| Frontend mock data          | ✅ Currently used     |
| Express server              | ✅ Started            |
| Backend API                 | 🚧 Early development |
| Frontend-backend connection | ⏳ Not implemented    |
| Database                    | ⏳ Not implemented    |
| User authentication         | ⏳ Not implemented    |
| Real appointment system     | ⏳ Planned            |
| Real patient records        | ⏳ Planned            |
| Real-time queue             | ⏳ Planned            |
| Payment integration         | ⏳ Planned            |

---

## 🔜 Planned Features

The following features are planned for future development:

* [ ] Connect the React frontend to the Express backend
* [ ] Create a production-ready REST API
* [ ] Add a database
* [ ] Create patient management functionality
* [ ] Create doctor management functionality
* [ ] Build a real appointment booking system
* [ ] Add appointment availability and scheduling
* [ ] Add secure user authentication
* [ ] Add role-based access control
* [ ] Create Admin, Doctor, Staff, and Patient roles
* [ ] Add patient medical records
* [ ] Add billing and invoice management
* [ ] Add clinic reports
* [ ] Add real-time queue and token management
* [ ] Add online payment integration
* [ ] Improve validation and error handling
* [ ] Add backend testing
* [ ] Deploy the frontend and backend

---

## 🔐 Environment Variables

Create the following environment file for the backend:

**File:**

```text
backend/src/.env
```

Add:

```env
PORT=3000
```

> Do not commit private environment variables, passwords, API keys, or database credentials to GitHub.

---

## 📝 Important Notes

* The frontend currently uses **static mock data**.
* The frontend is not yet connected to the Express backend.
* The backend currently contains basic learning and testing routes.
* The project does not currently use a database.
* Authentication is not yet implemented.
* The dashboard interfaces are currently frontend UI implementations.
* The application is actively being developed, so the project structure and features may change.

---

## 🤝 Contributing

This is currently a personal learning and development project.

Suggestions, improvements, and feedback are welcome. A contribution guide may be added in the future.

---

## 📄 License

No license has been added yet.

An MIT License may be added in the future if the project is opened for public contributions.

---

## 👩‍💻 Developer

**Darshana Bhandari**

Frontend Developer | MERN Stack Learner

GitHub: https://github.com/Darshana-Bhandari

---

## ⭐ Support

If you find this project useful or interesting, consider giving the repository a star ⭐

---

> **Note:** This project is actively under development. The frontend is currently more complete than the backend, and several planned features are still being implemented.
