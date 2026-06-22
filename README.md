# 🏥 MediChain — AI-Powered Medical Symptom Checker

> Full-stack MERN application with AI symptom prediction, geolocation doctor discovery, appointment booking, and Ethereum blockchain medical records.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Python 3.9+ with pip

---

## 📦 Setup & Installation

### 1. Clone & Install

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install

# Blockchain
cd ../blockchain
npm install
```

### 2. Train the ML Model (Python)

```bash
cd ml-service

# Create and activate virtual environment (recommended)
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Train model (takes ~30 seconds)
python train_model.py
```

### 3. Seed the Database

Make sure MongoDB is running, then:

```bash
cd server

# Seed 24 doctors across Indian cities
npm run seed

# Seed test patient
npm run seed-patient
```

### 4. Start All Services

Open **4 separate terminals**:

**Terminal 1 — Backend API:**
```bash
cd server
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 — ML Microservice:**
```bash
cd ml-service
venv\Scripts\activate
python app.py
# Runs on http://localhost:5001
```

**Terminal 3 — Frontend:**
```bash
cd client
npm run dev
# Runs on http://localhost:5173
```

**Terminal 4 — Hardhat (optional, for blockchain):**
```bash
cd blockchain
npx hardhat node
# In another terminal:
npx hardhat run scripts/deploy.js --network localhost
```

---

## 🔐 Demo Login Credentials

| Role    | Email                     | Password     |
|---------|---------------------------|--------------|
| Patient | patient@test.com          | patient123   |
| Doctor  | doctor1@medichain.com     | Doctor@123   |
| Doctor  | doctor2@medichain.com     | Doctor@123   |

---

## 🗂️ Project Structure

```
MediChain/
├── client/          # React + Tailwind frontend
├── server/          # Node.js + Express API
├── ml-service/      # Python Flask ML microservice
└── blockchain/      # Solidity smart contracts (Hardhat)
```

---

## 🔌 API Endpoints

| Method | Endpoint                         | Description              |
|--------|----------------------------------|--------------------------|
| POST   | /api/auth/register               | Register patient/doctor  |
| POST   | /api/auth/login                  | Login + get JWT tokens   |
| GET    | /api/auth/me                     | Get current user         |
| GET    | /api/auth/notifications          | Get in-app notifications |
| POST   | /api/symptoms/predict            | AI disease prediction    |
| GET    | /api/symptoms/list               | Get all symptoms         |
| GET    | /api/doctors/nearby              | Geospatial doctor search |
| GET    | /api/doctors/:id/slots           | Get available time slots |
| POST   | /api/appointments/book           | Book appointment         |
| GET    | /api/appointments/:userId        | Get user's appointments  |
| PATCH  | /api/appointments/:id/status     | Confirm/cancel (doctor)  |
| POST   | /api/appointments/:id/diagnosis  | Add diagnosis (doctor)   |
| POST   | /api/records/add                 | Save blockchain record   |
| GET    | /api/records/:patientId          | Get patient records      |
| GET    | /api/records/verify/:hash        | Verify record hash       |

---

## 🤖 ML Model

- **Algorithm:** Random Forest Classifier (150 trees)
- **Dataset:** Synthetic dataset — 4,920 samples × 41 diseases
- **Features:** 131 binary symptom features
- **Accuracy:** ~95%+ on test split
- **Output:** Disease prediction + confidence score + specialist type

---

## ⛓️ Blockchain

- **Smart Contract:** `MedicalRecords.sol` (Solidity ^0.8.19)
- **Network:** Hardhat local (chainId 1337)
- **Functions:** `addRecord()`, `grantAccess()`, `revokeAccess()`, `getRecord()`, `verifyRecord()`
- **Hash:** SHA-256 of medical record data

---

## 🛠️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18 + Vite + Tailwind CSS 3   |
| Backend    | Node.js + Express.js                |
| Database   | MongoDB + Mongoose                  |
| ML Service | Python + Flask + scikit-learn       |
| Blockchain | Ethereum + Solidity + Hardhat       |
| Auth       | JWT (access + refresh tokens)       |
| Maps       | Leaflet.js + OpenStreetMap          |
