# QKart eCommerce App

QKart is a full-stack shopping application with a React storefront and an Express API backed by MongoDB. It supports account registration and login, product search, a persistent cart, address management, and wallet-based checkout.

## Features

- Browse and search the product catalog.
- Register, sign in, and manage an authenticated shopping cart.
- Add products to a cart and update quantities.
- Save a delivery address and check out using the account wallet.
- Use readiness and liveness endpoints for deployment health checks.

## Technology

- **Frontend:** React 19, React Router, Ant Design, Vite
- **Backend:** Node.js (20.19 or newer), Express 5, Mongoose, JWT authentication
- **Database:** MongoDB replica set or MongoDB Atlas; checkout uses transactions
- **Deployment:** Docker Compose, Nginx, GitHub Actions, GitHub Container Registry

## Repository layout

- `frontend/` — React application and Nginx configuration
- `backend/` — Express API, MongoDB models, services, and tests
- `docker-compose.yml` — local container deployment for frontend and backend
- `.github/workflows/backend.yml` — CI checks, container builds, and image publishing

## Run locally

You need Node.js 20.19 or newer and access to a MongoDB replica set. The application does not include a local MongoDB server.

### 1. Configure and start the API

Copy `backend/.env.example` to `backend/.env` if you do not already have a backend environment file. Set the database URI, a JWT secret, and the frontend origin:

```dotenv
NODE_ENV=development
PORT=8082
MONGODB_URL=mongodb://127.0.0.1:27017/qkart
JWT_SECRET=replace-with-a-random-secret
CORS_ORIGINS=http://localhost:5173
```

Use a replica set for checkout and use your own MongoDB credentials. Do not commit environment files or secrets.

Install dependencies and start the API:

```sh
cd backend
npm ci
npm run dev
```

To add the repeatable sample catalog to the configured database, run this from `backend/`:

```sh
npm run seed:products
```

The seed command inserts missing original and sample products. It preserves existing catalog entries, except for repairing the known invalid `google.com` image on the legacy bat product. Set `MONGODB_URL` to the database you intend to populate before running it.

### 2. Configure and start the storefront

Create `frontend/.env.local` with the API URL:

```dotenv
VITE_API_BASE_URL=http://localhost:8082/v1
```

Then start Vite in a second terminal:

```sh
cd frontend
npm ci
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`).

## API routes

All application API routes use the `/v1` prefix.

- `POST /v1/auth/register` and `POST /v1/auth/login`
- `GET /v1/products` and `GET /v1/products/:productId`
- `GET /v1/cart`, `POST /v1/cart`, and `PUT /v1/cart` (authenticated)
- `PUT /v1/cart/checkout` (authenticated)
- `GET /v1/users/:userId` and `PUT /v1/users/:userId` (authenticated)
- `GET /health/live` and `GET /health/ready`

Checkout atomically debits the wallet and empties the cart in a MongoDB transaction, so the database must support transactions.

## Checks and tests

Run frontend linting and a production build:

```sh
cd frontend
npm run lint
npm run build
```

Run backend syntax validation and tests:

```sh
cd backend
npm run check
npm test
```

The backend integration tests require a dedicated disposable MongoDB test database on a replica set. The test setup clears the configured test database; do not point it at production or a database containing data you need to keep. The CI workflow starts an isolated MongoDB replica set for these tests.

## Responsive layout

The product listing uses responsive Ant Design grid spans, and the global stylesheet includes a breakpoint at 768px. The home, login, registration, product, checkout, and order confirmation routes were smoke-tested at a 390px viewport with no horizontal overflow. Repeat browser and device checks for the browsers and devices you support before release.

## Docker Compose

Docker Compose runs the frontend behind Nginx and the backend on the internal Compose network. It expects an external MongoDB replica set.

1. Copy the root `.env.example` to `.env`.
2. Set `MONGODB_URL` and a random `JWT_SECRET` of at least 32 characters. Set `CORS_ORIGINS` to the storefront origin (default `http://localhost:8080`).
3. From the repository root, run:

```sh
docker compose up --build
```

Open `http://localhost:8080`. Set `FRONTEND_PORT` in the root `.env` to change the published port, and update `CORS_ORIGINS` to match. Stop the containers with `docker compose down`.

## CI and container images

The GitHub Actions workflow runs backend checks and integration tests, builds the frontend, and builds both container images. On pushes to `main` and version tags matching `v*.*.*`, it publishes the frontend and backend images to GHCR as:

- `ghcr.io/<owner>/<repository>-frontend`
- `ghcr.io/<owner>/<repository>-backend`

The workflow publishes images; it does not configure deployment to a hosting provider.
