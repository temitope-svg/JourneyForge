# JourneyForge

Vite and React with TypeScript, TanStack Router, TanStack Query, Zod, and Biome.

```sh
npm install
npm run dev
```

- `npm run build` type-checks the project and builds it for production.
- `npm run check` runs Biome's formatting and lint checks.
- `npm run lint` runs Biome's linter.
- `npm run format` applies Biome formatting.

## Mock data

The homepage reads its mock data from `backend/home.json` through
`src/homeContent.ts`. When integrating the real backend, update that module
and its consumers to load the API data, then delete the `backend/` folder.

## Demo accounts

Create an account with a test email and any throwaway password of at least
eight characters, then confirm the email on the simulated verification screen.
To sign in again, use that email and the shared demo password `journey-demo`.

The browser stores the email and verification status locally. The signed-in
session lasts for the tab. Signup passwords are discarded. Email delivery,
Google sign-in, and password recovery remain previews.
