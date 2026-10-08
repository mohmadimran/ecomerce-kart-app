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

The process exits with a nonzero status if startup configuration or the MongoDB connection fails. It handles `SIGINT` and `SIGTERM` by draining HTTP connections and disconnecting from MongoDB. Configure the platform to send one of these signals during shutdown.

## Health checks

- `GET /health/live` reports whether the process is running.
- `GET /health/ready` returns `200` only while MongoDB is connected; otherwise it returns `503`.

Production logs use JSON and include a request ID, HTTP method, path, status, and duration. The auth rate limiter uses an in-process store, so deployments with multiple backend instances should enforce a shared rate limit at the gateway or load balancer as well.
