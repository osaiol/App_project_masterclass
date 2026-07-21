# App_project_masterclass

# EventCentre Bookings

EventCentre Bookings is a lightweight, fully responsive event management web application designed to eliminate scheduling conflicts for venue rentals. It provides event planners with a simple interface to check availability and submit booking requests, while offering center administrators a secure dashboard to manage approvals and cancellations.

## Features

- **Public Availability Calendar:** Planners can view up to 14 days of calendar dates and easily identify open vs. booked time slots.
- **Booking Request Form:** A streamlined form for capturing planner details, contact information, and event specifics.
- **Secure Admin Dashboard:** A JWT-protected Kanban-style dashboard for venue staff to manage operations.
- **Booking Management:** Admins can instantly approve or cancel requests. Approved requests automatically block out the calendar slot for the public.
- **Modern UI/UX:** Built with a premium Cyan Blue & Navy Blue aesthetic, utilizing glassmorphism effects and fully responsive layouts.

## Tech Stack

- **Frontend:** React, Vite, React Router, Axios, Lucide React (Icons), Vanilla CSS
- **Backend:** Node.js, Express.js, JSON Web Tokens (JWT), bcrypt
- **Database:** SQLite

## Project Structure

- `/frontend` - Contains the React Single Page Application (SPA).
- `/backend` - Contains the Node.js API server and the SQLite database file.

## Setup and Installation

To run this project locally, you will need to start both the backend server and the frontend development server. Ensure you have [Node.js](https://nodejs.org/) installed.

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the server (this will also automatically initialize the SQLite database and seed the default admin):
   ```bash
   node server.js
   ```
   *The backend will run on `http://localhost:3001`.*

### 2. Frontend Setup

1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The frontend will be accessible at `http://localhost:5173/`.*

## Admin Access

To manage bookings, navigate to `http://localhost:5173/admin` and log in using the default credentials:

- **Username:** `admin`
- **Password:** `admin123`

*(Note: In a production environment, you should change these credentials and set up environment variables for secrets like the JWT secret key.)*
