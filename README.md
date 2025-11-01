# TurfArena

A comprehensive sports turf booking and management platform built with React, Node.js, Express, and MongoDB.

## Features

- User authentication (JWT and Google OAuth)
- Turf booking and management
- Match creation and matchmaking
- Real-time chat and notifications
- Team management
- Payment integration (Razorpay)
- Admin dashboard
- Responsive design

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Socket.io-client for real-time features

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.io for real-time communication
- JWT for authentication
- Google OAuth 2.0
- Razorpay for payments

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Git

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

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@turfarena.com or join our Discord community.
