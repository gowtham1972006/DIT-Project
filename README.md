<div align="center">

# 🧠 MindGuard
### *A Digital Sanctuary for Student Well-Being*

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://vercel.com/)


> A safe, anonymous, and supportive platform where students can express themselves, access mental wellness tools, and connect with peer supporters — all in one place.

</div>

---

## ✨ Features

### 🔐 Authentication & Roles
- Secure **JWT-based** session cookies (via `jose`)
- Three user roles: **Student**, **Peer Supporter**, **Admin**
- Peer supporter registration requires admin approval before access is granted
- Passwords are hashed with **bcryptjs**

### 💬 AI Chat Support
- Intelligent conversational support powered by the **Groq API** (LLaMA)
- Sentiment analysis with a **graduated alert system** — low / medium / high intensity
- High-intensity alerts are flagged and visible to the admin dashboard
- Completely anonymous for students

### 🤝 Peer-to-Peer Support Chat
- Students can request a live peer support session with a topic
- Approved peer supporters see a real-time queue and can accept sessions
- Chat delivered via **HTTP long-polling** (Vercel-compatible, no Socket.IO dependency)
- Messages poll every 2 seconds — real-time feel without a persistent server

### 🧘 Relaxation Room
- Guided breathing exercises with animated visuals
- Curated music and ambient sounds
- Mindfulness activities and journaling prompts

### 💪 Body Building & Fitness
- Exercise library with step-by-step instructions
- Built-in workout timer
- Structured fitness routines for students

### 🎯 Career Guidance
- Curated career exploration tools and resources
- Role-specific advice for students

### 🛡️ Admin Dashboard
- View all registered users (students & peers)
- Approve or reject peer supporter applications
- Monitor high-intensity AI chat alerts
- Full session oversight

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | JavaScript (JSX) |
| Styling | Vanilla CSS (custom design system) |
| Database | [MongoDB Atlas](https://www.mongodb.com/atlas) via Mongoose |
| Authentication | JWT (`jose`) + `bcryptjs` |
| AI / LLM | [Groq API](https://groq.com/) (LLaMA 3) |
| Deployment | [Vercel](https://vercel.com/) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- A [Groq](https://console.groq.com/) API key

### 1. Clone the repository

```bash
git clone https://github.com/gowtham1972006/DIT-Project.git
cd DIT-Project
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the project root:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?appName=Cluster0
JWT_SECRET=your_long_random_secret_here
GROQ_API_KEY=your_groq_api_key_here
```

> ⚠️ **Never commit `.env.local` to git.** It is already listed in `.gitignore`.

### 4. Seed the admin account

```bash
node reset-admin.js
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
mindguard/
├── src/
│   ├── app/
│   │   ├── page.jsx              # Landing page
│   │   ├── login/                # Login page
│   │   ├── register/             # Student & peer registration
│   │   ├── dashboard/            # Student dashboard
│   │   ├── chat/                 # AI chat support
│   │   ├── peer/                 # Peer queue & chat
│   │   │   └── chat/[sessionId]/ # Live peer chat room (HTTP polling)
│   │   ├── relaxation/           # Relaxation room
│   │   ├── fitness/              # Fitness & bodybuilding module
│   │   ├── career/               # Career guidance
│   │   ├── admin/                # Admin dashboard
│   │   └── api/
│   │       ├── chat/             # AI chat + alert API
│   │       └── peer-session/
│   │           ├── route.js          # Create / list sessions
│   │           └── [sessionId]/
│   │               ├── route.js      # Session info + peer join
│   │               ├── messages/     # GET poll + POST send
│   │               └── status/       # Status check + end/join actions
│   └── lib/
│       ├── db.js                 # Mongoose connection + all models
│       └── auth.js               # JWT session helper
├── reset-admin.js                # One-time admin seed script
├── server.js.local-backup        # Legacy Socket.IO server (local dev reference)
└── package.json
```

---

## 🌐 Deployment (Vercel)

1. Push this repository to GitHub.
2. Import the project in [Vercel](https://vercel.com/new).
3. In **Settings → Environment Variables**, add:

   | Variable | Value |
   |----------|-------|
   | `MONGODB_URI` | Your Atlas connection string |
   | `JWT_SECRET` | A long random secret |
   | `GROQ_API_KEY` | Your Groq API key |

4. In **MongoDB Atlas → Network Access**, add `0.0.0.0/0` — Vercel uses dynamic IPs.
5. After deployment, run `node reset-admin.js` locally (pointed at Atlas) to seed the admin account.

---

## 🔑 Default Admin Credentials

After running `reset-admin.js`:

| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | Set by `reset-admin.js` |

> Change the admin password immediately after your first login.

---

## 🛡️ Privacy & Safety Design

- Students are **fully anonymous** — peer supporters and AI never see real names.
- Each student is assigned a random anonymous ID at registration.
- The graduated alert system (`low → medium → high`) ensures high-risk conversations surface to counselors without breaking student trust.
- Sessions are stored encrypted in MongoDB Atlas with restricted network access.

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.


---

<div align="center">

Built with ❤️ for student well-being · **MindGuard** © 2025

</div>
