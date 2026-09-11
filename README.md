# 🌾 AgriSurvey – Smart Agriculture Public Survey Web Platform

[![Full Stack](https://img.shields.io/badge/Stack-Node.js%20%7C%20Express%20%7C%20HTML5%20%7C%20CSS3%20%7C%20JS-2d6a4f?style=for-the-badge)](https://github.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-e9c46a.svg?style=for-the-badge)](LICENSE)
[![Status: Complete](https://img.shields.io/badge/Status-Completed%20%E2%9C%93-52b788?style=for-the-badge)](https://github.com/)

> **A modern, responsive, full-stack public survey platform designed to empower agricultural communities, capture grassroots farming challenges, and provide structured insights on crop production, irrigation, climate resilience, farm finances, and government policies.**

---

## 📸 Overview & Key Modules

* **🏠 Landing Page (`index.html`):** High-impact hero section, live statistics counters, 8 agriculture domain cards, 8-step roadmap, and inquiry contact form.
* **🔐 Authentication (`login.html` & `register.html`):** Farmer registration and login with 1-click **"Auto-Fill Demo Credentials"** for instant presentations.
* **📝 8-Step Interactive Survey Wizard (`survey.html`):** Comprehensive 54-question survey engine with a live percentage progress bar, selectable option cards, dynamic conditional logic (e.g. loan fields), and auto-save draft functionality.
* **📊 Results & Summary Dashboard (`result.html`):** Automated submission summary card, key metric counters (Crop, Season, Land Size, Irrigation, Rating), structured data table, and printable PDF report format.
* **⚙️ Backend REST API (`server.js`):** Built-in Express.js backend with JSON data persistence and REST API endpoints.

---

## 🚀 Quick Start (Local Setup)

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/AgriSurvey.git
cd AgriSurvey
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the application
```bash
npm start
```
Open **[https://agrisurvey.netlify.app](https://agrisurvey.netlify.app/)** in Google Chrome.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | HTML5 Semantic Markup | Accessible, multi-page structure with clean form tags |
| **Styling** | Vanilla CSS3 Design System | Agriculture-inspired green/gold palette, glassmorphism, responsive grid & print styling |
| **Client Logic** | Vanilla JavaScript (ES6+) | 8-stage state machine, input validation engine, conditional field rendering |
| **Backend API** | Node.js & Express.js | Lightweight REST API for authentication, surveys, and aggregated statistics |
| **Data Storage** | File-based JSON Database & LocalStorage | Dual-mode persistence for zero-config offline runs and full-stack deployments |

---

## 📡 Backend REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status check |
| `POST` | `/api/auth/register` | Register a new farmer user account |
| `POST` | `/api/auth/login` | Authenticate user credentials |
| `POST` | `/api/surveys` | Submit a completed 54-parameter agricultural survey |
| `GET` | `/api/surveys` | Retrieve all submitted survey records |
| `GET` | `/api/surveys/:id` | Retrieve a specific survey record by ID |
| `GET` | `/api/stats` | Get aggregated stats (crop distribution & average satisfaction) |

---

## 📂 Project Structure

```text
AgriSurvey/
├── data/
│   ├── users.json           # User account records
│   └── surveys.json         # Submitted survey data
├── assets/
│   └── farm-hero.svg        # Agricultural vector illustration
├── css/
│   └── style.css            # Complete design system & responsive styling
├── js/
│   ├── main.js              # Toast notifications & navbar controller
│   ├── auth.js              # Client auth & session management
│   ├── validation.js        # Input validation helpers
│   └── survey.js            # 8-step wizard controller & demo auto-fill
├── index.html               # Homepage & survey roadmap
├── login.html               # Farmer login
├── register.html            # User registration
├── survey.html              # 8-stage survey wizard (Q1 - Q54)
├── result.html              # Submission summary & PDF report
├── server.js                # Express backend REST API
├── package.json             # NPM dependencies & scripts
└── README.md                # Project documentation
```

---

## 🌐 Deploy to Cloud (1-Click Hosting)

* **Render / Railway / Heroku:** Deploy the repository directly as a Node.js web service running `npm start`.
* **GitHub Pages / Vercel / Netlify:** Can be hosted as a static web app (Frontend automatically falls back to LocalStorage if backend is not active).

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
