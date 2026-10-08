# Backend deployment

## Production setup

Use Node.js 20.19 or newer. Configure the following environment variables in the hosting provider (do not commit `.env`):

- `NODE_ENV=production`
- `PORT` (the platform assigned port, if applicable)
- `MONGODB_URL` (a MongoDB replica set or Atlas connection string)
- `JWT_SECRET` (a randomly generated secret with at least 32 characters)
- `CORS_ORIGINS` (comma-separated, exact frontend origins, including scheme and port)
- `TRUST_PROXY_HOPS` (number of trusted reverse proxy hops; leave `0` unless the app is behind a proxy)
- Optional: `MONGO_MAX_POOL_SIZE`, `BCRYPT_SALT_ROUNDS`, and `LOG_LEVEL`

Checkout uses a MongoDB transaction to debit the wallet and empty the cart as one operation. The database must support transactions, which requires a replica set (including a single-node replica set for self-hosted MongoDB).

Install and start the production application from this directory:

```sh
npm ci --omit=dev
npm start
```

## Docker Compose

The repository root Compose configuration builds and runs both the React frontend and Node.js backend. Nginx serves the frontend and proxies `/v1` requests to the backend container. The backend port is only exposed on the internal Compose network.

1. Copy `.env.example` to `.env` in the repository root.
2. Set `MONGODB_URL` to a MongoDB replica set or Atlas URI and replace `JWT_SECRET` with a random secret of at least 32 characters.
3. Run from the repository root:

```sh
docker compose up --build
```

Open `http://localhost:8080` (or the port configured with `FRONTEND_PORT`). Compose builds from both `frontend/` and `backend/`. It does not start MongoDB; use an external replica set because checkout requires transactions. If you change `FRONTEND_PORT`, set `CORS_ORIGINS` to the matching origin too. Stop the app with `docker compose down`.

To build only the backend image, run `docker build -t qkart-backend:local ./backend`. The image runs as the unprivileged `node` user, contains production dependencies only, and checks readiness through `/health/ready`.

## CI and image publishing

The GitHub Actions workflow checks backend syntax, runs backend integration tests against an isolated MongoDB replica set, builds the frontend and both Docker images for pushes and pull requests. A successful push to `main` or a `v*.*.*` tag also publishes `ghcr.io/<owner>/<repository>-backend` and `ghcr.io/<owner>/<repository>-frontend` to GitHub Container Registry (GHCR). No hosting provider deployment is configured; point your hosting service at the published images to deploy them.

The process exits with a nonzero status if startup configuration or the MongoDB connection fails. It handles `SIGINT` and `SIGTERM` by draining HTTP connections and disconnecting from MongoDB. Configure the platform to send one of these signals during shutdown.

## Health checks

- `GET /health/live` reports whether the process is running.
- `GET /health/ready` returns `200` only while MongoDB is connected; otherwise it returns `503`.

Production logs use JSON and include a request ID, HTTP method, path, status, and duration. The auth rate limiter uses an in-process store, so deployments with multiple backend instances should enforce a shared rate limit at the gateway or load balancer as well.
