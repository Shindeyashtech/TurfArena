<p align="center">
  <img src="frontend/src/pages/Screenshot 2025-11-01 142444.png" alt="Project Banner" width="100%" />
</p>




<h1 align="center">🏏 TurfArena — Cricket Turf Booking Platform</h1>

<p align="center">
  A full-stack cricket turf booking and team management platform built on the <b>MERN stack</b>.
  <br />
  Users can book turfs, form teams, and join matches — owners can list and manage their turfs effortlessly.
</p>

**TurfArena** is a full-stack open-source platform that connects turf owners, team captains, and players into a unified digital ecosystem.  

## 🌐 Project Overview

TurfArena redefines how cricket communities operate by digitizing every aspect of the sport management workflow. It connects **turf owners**, **players**, and **teams** through one smart system that supports **real-time communication**, **analytics**, and **secure transactions**.

## 🎯 Project Goal & Idea

To provide a comprehensive, scalable platform for cricket turf booking, team formation, and match coordination — creating a connected ecosystem for players, owners, and admins.

**Vision:**  
Empower every cricket enthusiast to play smarter, organize faster, and experience the sport digitally.

## 💡 Problems Solved

- **Manual Bookings → Smart Scheduling**  
  Eliminates double-bookings and communication gaps with automated turf availability.
- **Team Formation Chaos → Streamlined Rosters**  
  Helps players find, form, and manage teams efficiently.
- **Disconnected Match Coordination → Real-time Updates**  
  Socket.io integration ensures seamless communication.
- **Unmanaged Payments → Trusted Digital Transactions**  
  Integrated Razorpay for secure, automated payment flows.
- **No Analytics → Business Intelligence**  
  Admin dashboards with analytics and performance tracking.
- **Local Limitations → Cloud Scalability**  
  Cloud-based architecture supports multi-location expansion.

## ⚙️ Scalability Features

- **Microservices Architecture** – Modular backend with independent routes.  
- **Real-time Communication** – Socket.io for instant match and chat updates.  
- **Cloud Database** – MongoDB Atlas with global availability.  
- **Horizontal Scaling** – Stateless Node.js backend supports multi-instance deployment.  
- **Geospatial Search** – MongoDB’s geolocation features for nearby turf discovery.  
- **Admin Dashboard** – Central control over turfs, users, and analytics.  
- **Analytics Integration** – Revenue and engagement tracking for growth insights.  
- **Payment Gateway** – Razorpay for secure digital payments.  
- **Cloud Storage** – Cloudinary integration for image management.

## 🧠 Tech Stack

### Backend
- **Runtime:** Node.js  
- **Framework:** Express.js  
- **Database:** MongoDB + Mongoose ODM  
- **Auth:** JWT + Passport.js (with Google OAuth 2.0)  
- **Real-time:** Socket.io  
- **Payments:** Razorpay  
- **Uploads:** Multer + Cloudinary  
- **Security:** bcryptjs, CORS  
- **Development:** Nodemon  

### Frontend
- **Framework:** React 18  
- **Router:** React Router DOM v7  
- **Styling:** Tailwind CSS  
- **State Management:** Context API  
- **HTTP Client:** Axios  
- **Real-time:** Socket.io Client  
- **Charts:** Chart.js + React Chart.js 2  
- **PDF Generation:** jsPDF + jsPDF AutoTable  
- **Icons:** Lucide React  
- **Dates:** date-fns  
- **Notifications:** React Toastify  

### Infrastructure
- **Database Hosting:** MongoDB Atlas  
- **Deployment:** AWS / Heroku / Vercel ready  
- **Environment Config:** dotenv  

## 🔑 Core Features

- User Authentication (JWT + Google OAuth)  
- Turf Management (CRUD with availability tracking)  
- Team Creation & Management  
- Match Scheduling & Time Slot Booking  
- Payment Gateway Integration (Razorpay)  
- Real-time Chat (Socket.io)  
- Notifications & Alerts  
- Admin Dashboard  
- Analytics & Leaderboards  
- Cloud Storage (Cloudinary)  
- Location-based Turf Discovery  

## 🔒 Authentication & Security

- **JWT Authentication** – Secure token-based access.  
- **Google OAuth 2.0** – Social login for easy onboarding.  
- **Role-based Access Control** – Separate privileges for players, owners, and admins.  
- **Password Security** – bcrypt hashing with salted encryption.  
- **Session Expiry** – Token expiration with refresh logic.  
- **Protected Routes** – Middleware-driven security.  

## 💼 Business & User Model

- Multi-role access: Players, Team Captains, Turf Owners, Administrators.  
- Revenue Model: Commission on bookings + premium features.  
- Match Formats: T20, ODI, Test, and stake-based matches.  
- Offline Support: Manual booking and payment entries.  
- Mobile-first Responsive Design.  
- Optimized Performance (compression, caching, and indexing).  

## 🛣️ Future Roadmap

- 📱 Native Mobile Apps (iOS & Android)  
- 🤖 AI Matchmaking – Smart team & opponent suggestions  
- 🎥 Live Match Streaming Integration  
- 🕹️ E-sports & Multi-sport Expansion  
- 🌍 Multi-language Support (i18n)  
- 🔌 API Marketplace for external integrations  
- 📊 Machine Learning Analytics for player performance insights  

## 🧑‍💻 Setup & Installation
### Installation

1. Clone the repository:
```bash
git clone https://github.com/Shindeyashtech/TurfArena.git
cd turfarena
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Set up environment variables:

Copy the example environment files and configure them:

```bash
# Backend
cp .env.example .env
# Edit backend/.env with your configuration

# Frontend
cp .env.example .env
# Edit frontend/.env with your configuration
```

5. Start the backend server:
```bash
cd backend
npm start
```

6. Start the frontend development server:
```bash
cd frontend
npm start
```

The application will be available at `http://localhost:3000`

## Environment Variables

### Backend (.env)
- `MONGODB_URI`: MongoDB connection string
- `PORT`: Server port (default: 5000)
- `FRONTEND_URL`: Frontend URL for CORS
- `JWT_SECRET`: Secret key for JWT tokens
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `RAZORPAY_KEY_ID`: Razorpay key ID
- `RAZORPAY_KEY_SECRET`: Razorpay key secret

### Frontend (.env)
- `REACT_APP_API_URL`: Backend API URL
  
## Project Structure

```
turfarena/
├── backend/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── scripts/         # Utility scripts
│   ├── socket/          # Socket.io handlers
│   ├── utils/           # Utility functions
│   └── server.js        # Main server file
├── frontend/
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── context/     # React context providers
│   │   ├── pages/       # Page components
│   │   ├── utils/       # Utility functions
│   │   └── App.js       # Main app component
│   └── package.json
├── .gitignore
├── README.md
└── package.json
```
# 🧩 Contribution Guide 

Contributions are welcome! 

Please read the CONTRIBUTING.md file for detailed steps on how to fork, branch, and submit a pull request.

# ⚖️ License 

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.
feel free to use, modify, and distribute with attribution. 
© 2025 TurfArena 

# 📣 Acknowledgements
MongoDB Atlas for scalable cloud database hosting 

Razorpay for secure payment processing 

Cloudinary for image management 

The open-source community for inspiration and collaboration
