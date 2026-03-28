# LuminaBridge Monorepo

This project is a monorepo containing the LuminaBridge Buyer, Admin, and Factory portals.

## Structure

- `apps/main`: Handles `luminbridge.com` (Buyer) and `admin.luminbridge.com` (Admin).
- `apps/factory`: Handles `factorybridge.com` (Factory Portal).
- `packages/ui`: Shared React components and design system.
- `packages/db`: Shared database client and logic.
- `packages/types`: Shared TypeScript definitions.

## Development

Install dependencies:
```bash
npm install
```

Run all apps in development mode:
```bash
npm run dev
```

The portals will be available at:
- Buyer/Admin: `http://localhost:3000`
- Factory: `http://localhost:3001`

## Deployment

This monorepo is designed to be deployed as two separate projects on Vercel:
1. **Main App**: Point to `apps/main` as the root directory.
2. **Factory App**: Point to `apps/factory` as the root directory.

Configure the same `DATABASE_URL` for both projects to ensure data consistency.
