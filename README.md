# 🧬 MediAI — AI-Powered Symptom Diagnosis System

A full-stack MERN application with integrated Anthropic Claude AI for intelligent symptom analysis and preliminary health diagnosis.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6 |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| AI Engine | Anthropic Claude (claude-sonnet-4-20250514) |
| Auth | JWT + bcryptjs |

---

## 📁 Project Structure

```
symptom-diagnosis-app/
├── backend/
│   ├── server.js              # Express app entry
│   ├── package.json
│   ├── .env.example           # ← Copy to .env and fill in
│   ├── models/
│   │   └── User.js            # Mongoose user schema
│   ├── routes/
│   │   ├── auth.js            # Register / Login / Me
│   │   └── diagnosis.js       # AI analysis endpoint
│   └── middleware/
│       └── auth.js            # JWT protect middleware
└── frontend/
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── index.js
        ├── App.js             # Router + auth state
        ├── index.css          # Global styles + CSS vars
        └── pages/
            ├── Login.jsx      # Sign in / Register page
            └── Diagnosis.jsx  # Main AI analysis page
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- Anthropic API key → https://console.anthropic.com

---

### 1. Backend Setup

```bash
cd backend
npm install
```

Create your `.env` file:
```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/symptom_diagnosis
JWT_SECRET=your_super_secret_key_here
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Start the backend:
```bash
npm run dev      # Development (nodemon)
npm start        # Production
```

---

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start        # Runs on http://localhost:3000
```

---

### 3. Usage

1. Open **http://localhost:3000**
2. **Register** a new account or **Sign In**
3. On the Diagnosis page:
   - Enter your symptoms in detail
   - Optionally add age, gender, and duration
   - Click **"Analyze Symptoms"**
4. Receive AI-powered analysis:
   - Possible conditions with probability scores
   - Recommended actions
   - Urgency level classification
   - General health advice

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | Sign in, receive JWT |
| GET | `/api/auth/me` | Get current user (protected) |

### Diagnosis
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/diagnosis/analyze` | AI symptom analysis (protected) |
| GET | `/api/diagnosis/history` | Get past diagnoses (protected) |

---

## ⚕️ Medical Disclaimer

This application is for **educational and informational purposes only**. It does not provide real medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional for medical concerns. In emergencies, call your local emergency services immediately.

---

## 🔐 Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Backend server port (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing JWTs |
| `ANTHROPIC_API_KEY` | Your Anthropic API key |
