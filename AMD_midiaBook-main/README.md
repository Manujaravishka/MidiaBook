# MediBook — Hospital Management System

A cross-platform mobile application for hospital appointment management built with React Native (Expo) and Firebase. Supports three user roles — Admin, Doctor, and Patient — each with a dedicated dashboard and workflow.

## Overview

MediBook connects patients with healthcare providers through a digital platform. Patients discover doctors by specialization, book appointments, and manage their visits. Doctors manage their appointment queue with accept/reject/complete actions. Admins oversee the entire system — managing doctors, monitoring appointments, and viewing real-time statistics.

## Features

### Patient
- **Doctor Discovery** — Browse active doctors with search by name, specialization, or hospital; filter by specialization chips
- **Appointment Booking** — Select a doctor, pick a date (with arrow navigation), choose from 12 time slots, add a reason, and confirm
- **Appointment Management** — View upcoming/completed/cancelled appointments; cancel pending or accepted appointments
- **Doctor Profile Modal** — View full doctor details (qualification, experience, hospital) and book directly
- **Inline Booking** — Home screen booking form appears when a doctor card is selected
- **Responsive Doctor List** — FlatList with batch pagination (10 per load), search, and specialization filters
- **User Profile** — View and edit name/phone; toggle dark mode; logout with confirmation

### Doctor
- **Appointment Queue** — View all appointments assigned to the logged-in doctor
- **Status Management** — Accept, reject, or mark appointments as completed
- **Statistics** — Upcoming, completed, and total appointment counts

### Admin
- **Dashboard** — Real-time stats (total doctors, patients, today's appointments, pending/accepted/completed/cancelled/rejected counts)
- **Doctor Management** — View all doctors, add new doctors, edit details, activate/deactivate accounts
- **Appointment Oversight** — View all appointments across the system with status filters and search

### Cross-Cutting
- **Firebase Authentication** — Email/password sign-in and registration
- **Real-time Sync** — Firestore `onSnapshot` listeners keep all data in sync across devices
- **Three Role-based Dashboards** — Admin, doctor, and patient each see a tailored interface
- **Dark Mode** — System-aware theme with manual toggle, persisted per session
- **Animated Transitions** — Subtle fade-in and slide-up animations on cards and screens
- **Responsive Layout** — ScrollView and FlatList compositions work across phone sizes

## Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| React Native 0.81 | Cross-platform mobile framework |
| Expo SDK 54 | Managed workflow, build tooling |
| Expo Router 6 | File-based routing with route groups |
| TypeScript 5.9 | Type safety throughout |

### Backend & Database

| Technology | Purpose |
|------------|---------|
| Firebase Auth | Email/password authentication |
| Cloud Firestore | Real-time NoSQL database |

### Key Libraries

| Library | Purpose |
|---------|---------|
| `@expo/vector-icons` (Ionicons) | Icon set |
| `expo-linear-gradient` | Gradient backgrounds |
| `react-native-reanimated` (installed, not used in patient UI) | Animation engine |
| `react-native-safe-area-context` | Safe area insets |
| `react-native-screens` | Native screen containers |

### Tools

| Tool | Purpose |
|------|---------|
| EAS Build | Expo Application Services for CI/CD |
| ESLint (expo config) | Code linting |
| TypeScript | Static type checking |
| Prettier | Code formatting (via tailwind plugin, unused) |

## Project Structure

```
mediabook_final/
├── app/                              # Expo Router pages
│   ├── _layout.tsx                   # Root layout (ThemeProvider + AuthProvider + Stack)
│   ├── index.tsx                     # Splash screen entry point
│   ├── (auth)/                       # Authentication route group
│   │   ├── _layout.tsx               # Auth stack layout
│   │   ├── login.tsx                 # Email/password sign-in
│   │   └── register.tsx              # Patient registration
│   ├── (dashboard)/                  # Admin & Doctor dashboards
│   │   ├── admindash.tsx             # Full admin panel (stats, doctor CRUD, appointments)
│   │   ├── doctordash.tsx            # Doctor appointment management
│   │   └── patientdash.tsx           # Patient home (redirects to patient layout)
│   └── (patient)/                    # Patient mobile app
│       ├── _layout.tsx               # Custom tab layout with BottomNav
│       ├── index.tsx                 # Home: doctor cards, inline booking, appointments
│       ├── doctors.tsx               # Full doctor list with search, filters, pagination
│       ├── doctor-profile.tsx        # Bottom-sheet modal with booking form
│       ├── appointments.tsx          # Appointment list with status filters
│       └── profile.tsx               # Profile edit, dark mode toggle, logout
├── components/
│   └── ui/                           # Reusable UI components
│       ├── index.ts                  # Barrel exports
│       ├── Avatar.tsx
│       ├── Badge.tsx
│       ├── BottomNav.tsx             # Tab bar for patient layout
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── ConfirmDialog.tsx
│       ├── Container.tsx
│       ├── EmptyState.tsx
│       ├── Header.tsx
│       ├── Input.tsx
│       ├── LoadingSkeleton.tsx       # SkeletonCard, SkeletonStatRow
│       ├── SearchBar.tsx
│       ├── SectionHeader.tsx
│       ├── SplashScreen.tsx          # Animated splash with gradient
│       └── StatCard.tsx
├── constants/
│   └── theme.ts                      # Colors, DarkColors, Spacing, BorderRadius, Typography, Shadows
├── context/
│   ├── AuthContext.tsx                # Firebase auth state management
│   └── ThemeContext.tsx               # Dark/light theme toggle
├── services/
│   ├── firebase.ts                   # Firebase app initialization
│   ├── authService.ts                # signIn, register, logout
│   ├── adminService.ts               # Admin: doctor CRUD, stats subscriptions
│   ├── appointmentService.ts         # Book, update status, subscribe by role
│   └── doctorService.ts              # Subscribe active doctors
├── types/
│   └── index.ts                      # UserData, DoctorProfile, Appointment, DashboardStats, etc.
├── package.json
├── tsconfig.json
├── babel.config.js
├── metro.config.js
├── eslint.config.js
├── app.json
└── eas.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- A Firebase project with Authentication (Email/Password) and Firestore enabled

### Installation

```bash
git clone <repo-url>
cd mediabook_final
npm install
```

### Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → **Sign-in method** → **Email/Password**
3. Create a **Cloud Firestore** database (start in test mode for development)
4. Replace the Firebase config in `services/firebase.ts` with your project's credentials:

```ts
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

### Running

```bash
# Start Expo dev server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run in web browser
npm run web
```

### Seeding an Admin

On first launch, the app automatically creates an admin account:

- **Email:** `admin@hospital.com`
- **Password:** `Admin@123`

Use these credentials to log in and start adding doctors from the admin panel.

## Database Schema

### `users` collection

```ts
{
  uid: string,
  fullName: string,
  email: string,
  role: "admin" | "doctor" | "patient",
  phone?: string,
  gender?: string,
  specialization?: string,    // doctors only
  hospital?: string,          // doctors only
  experience?: number,        // doctors only
  qualification?: string,     // doctors only
  accountStatus: "active" | "inactive" | "deleted",
  createdAt: Timestamp
}
```

### `appointments` collection

```ts
{
  patientId: string,
  patientName: string,
  patientEmail: string,
  doctorId: string,
  doctorName: string,
  doctorEmail: string,
  specialization: string,
  hospital: string,
  appointmentDate: string,    // "YYYY-MM-DD"
  appointmentTime: string,    // "09:00 AM"
  reason: string,
  status: "pending" | "accepted" | "confirmed" | "completed" | "cancelled" | "rejected",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Environment

Firebase configuration is currently hardcoded in `services/firebase.ts`. For production use, migrate credentials to environment variables via `expo-constants` or a `.env` file with `expo-secure-store`.
