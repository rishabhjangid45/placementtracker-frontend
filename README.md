# Placement Tracker Frontend

A clean, modern, and dark-mode compatible React frontend application built for the Placement Tracker suite. Designed to help students monitor their interview pipelines, sync coding statistics, and manage resumes with ATS scoring.

---

## 🚀 Tech Stack

* **Framework**: React (TypeScript) + Vite
* **Styling**: Tailwind CSS + ShadCN UI primitives
* **Server State Management**: TanStack React Query (v5)
* **API Client**: Axios (configured with automated JWT request/response interceptors)
* **Visualization**: Recharts (for coding stats & job pipeline)
* **Routing**: React Router DOM (v6) with client-side SPA redirects

---

## ✨ Features

1. **Authentication & Authorization**
   * Secure Login & Registration with email/password validation.
   * Auto-assigns the default `"STUDENT"` role on sign up.
   * Centralized `AuthContext` with a JWT route guard (`ProtectedRoute`).
   * Axios request interceptor automatically attaches the Bearer token to all requests.

2. **Aggregator Dashboard**
   * **LeetCode / Coding Stats**: Displays solved questions and streaks. Includes a **Sync Account** option with a built-in **15-minute cooldown timer** to throttle crawl requests.
   * **Job Application Pipeline**: A custom Recharts bar chart showing status counts. Interactive filters allow you to click on any column to open the corresponding jobs.
   * **Recent Resume**: Shows your most recently uploaded resume.

3. **Job Tracker**
   * Displays all active applications in a clean table (Company, Role, Date, Status).
   * Supports changing application status (`APPLIED`, `OA`, `INTERVIEW`, `REJECTED`, `SELECTED`) via a dropdown.
   * Implements **Optimistic Updates** using React Query for snappy UI changes.
   * Allows adding new job applications through an inline form.

4. **Resume & ATS Management**
   * Drag-and-drop file upload (supports PDF, DOC, DOCX up to 5MB).
   * ATS Score Checker: Select an uploaded resume, paste a job description, and view a radial compatibility gauge.
   * Resume History: List of previous uploads with dates, scores, and **JWT-authenticated file downloads**.

---

## 🛠️ Getting Started

### Prerequisites

Ensure you have Node.js (v18+) and npm installed.

### Setup Instructions

1. **Clone the repository** and navigate to the project directory:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   *In development, leave the backend URL commented out to let Vite's dev server proxy handle CORS. Set the production URL when deploying.*

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Production Deployment

### API Base URL Configuration

The application is configured to switch routing modes automatically:
* **Development**: Requests go through the local Vite dev server proxy (forwarded to `http://localhost:8080`).
* **Production**: Requests point directly to your deployed Spring Boot URL via `VITE_API_BASE_URL` (which should be set on your host platform).

### Static Hosting Routing (Vercel & Netlify)

Because this app uses client-side routing, static hosts need to be instructed to fallback to `index.html` on page refreshes. The following configuration files have been provided:
* **Netlify**: `public/_redirects`
* **Vercel**: `vercel.json`
