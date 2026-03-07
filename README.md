# UDAAN-SME Digital Suite

A modern, professional SaaS ecosystem designed for Small and Medium Enterprises (SMEs) to digitize their business operations with simplicity and trust.

## 🚀 Quick Start

### 1. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory based on `.env.example`:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Run Development Server
```bash
npm run dev
```
The app will be available at `http://localhost:5173`.

---

## 🔐 Critical: Firestore Security Rules

To ensure the CRM, Inventory, and Sales modules work correctly, you **must** deploy the security rules.

### Manual Steps:
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Navigate to **Firestore Database** > **Rules**.
3. Copy everything from the local `firestore.rules` file.
4. Paste it into the console and click **Publish**.

---

## 🛠️ Tech Stack
- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS 4
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **PDF Generation**: jsPDF + html2canvas

## 📂 Project Structure
- `/src/context`: Auth and Business state management.
- `/src/services`: Firestore interaction logic (Sales, CRM, Inventory).
- `/src/pages`: Dashboard and module specific views.
- `/src/components`: Reusable UI elements (DataTable, StatCards).

## 📄 License
Private / Proprietary to UDAAN-SME.
