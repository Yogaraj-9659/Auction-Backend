# Auction Backend (Express + MongoDB + SendGrid)

## Setup
1. `npm install`
2. Copy `.env.example` to `.env` and fill values.
3. `npm run dev`

Key endpoints:
- `POST /api/auth/register` { name, email, password, contact, role: "user"|"seller" }
- `POST /api/auth/login` { email, password }
- `GET /api/auctions` list auctions
- `POST /api/auctions` (seller) create auction
- `POST /api/auctions/:id/bid` (auth) place bid
- `POST /api/auctions/:id/close` (seller) close auction
- `GET /api/products` (seller) my products
- `POST /api/products` (seller) create product
- `PUT /api/products/:id` (seller) update
- `DELETE /api/products/:id` (seller) delete
- `GET /api/users/bids` (auth) bid history
