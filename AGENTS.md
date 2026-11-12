# Architecture rules

- Keep pending real-backend query contracts in `src/lib/backendClient.ts`, reusing the managed client and session; do not edit generated database types or create a second auth client while the migration is pending.