# TurfArena

TurfArena is a web app for finding and booking sports turfs, organizing matches and teams, and communicating with other players.

## Features

- Turf discovery, booking, and owner management
- User registration, JWT login, and Google OAuth
- Match creation, matchmaking, and team management
- Real-time chat and notifications
- Admin tools and dashboards
- Mock checkout for standard booking payments; Razorpay credentials are needed for the match “lose-to-pay” flow

## Stack

- **Frontend:** React, Tailwind CSS, React Router, Axios, Socket.IO client
- **Backend:** Node.js, Express, MongoDB/Mongoose, Socket.IO, Passport, JWT

## Run locally

Requirements: Node.js 20 or newer and access to a MongoDB database (local or MongoDB Atlas).

1. Clone the repository and install the backend dependencies:

   ```sh
   git clone https://github.com/Shindeyashtech/TurfArena.git
   cd TurfArena/backend
   npm ci
   ```

2. Create `backend/.env` from the example and set the values:

   ```sh
   cp .env.example .env
   ```

   Required backend settings:

   | Variable | Purpose |
   | --- | --- |
   | `MONGO_URI` | MongoDB connection string |
   | `FRONTEND_URL` | Frontend origin allowed by CORS, e.g. `http://localhost:3000` |
   | `JWT_SECRET` | Secret used to sign login tokens |
   | `GOOGLE_CLIENT_ID` | Google OAuth client ID |
   | `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |

   `PORT` is optional and defaults to `5000`. Keep secrets in `.env`; never commit them.

3. Start the API from `backend/`:

   ```sh
   npm start
   ```

4. Open a second terminal in the repository root, then install and configure the frontend:

   ```sh
   cd frontend
   npm ci
   cp .env.example .env
   ```

   Set `REACT_APP_API_URL=http://localhost:5000` in `frontend/.env`, then start the app:

   ```sh
   npm start
   ```

   The frontend runs at `http://localhost:3000`.

## Deployment

- **Backend:** The root `render.yaml` configures the `turfarena-api` web service on Render. Set `MONGO_URI`, `FRONTEND_URL`, `GOOGLE_CLIENT_ID`, and `GOOGLE_CLIENT_SECRET` when Render prompts for them. Render generates `JWT_SECRET` and provides `PORT`.
- **Frontend:** Deploy `frontend/` as the Vercel project root. Set `REACT_APP_API_URL` to the deployed Render API URL, then redeploy.
- **Google OAuth:** After the API is deployed, add `https://<your-render-api-host>/api/auth/google/callback` as an authorized redirect URI in the Google OAuth client settings.
- **Payments:** The standard checkout currently uses mock payments. The “lose-to-pay” match flow requires `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` on the backend.

## Repository layout

```text
backend/   Express API, database models, routes, and Socket.IO handlers
frontend/  React application
render.yaml  Render backend service configuration
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidance. Please do not include credentials or production data in issues or pull requests.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
