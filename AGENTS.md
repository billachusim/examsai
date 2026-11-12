# Architecture rules

- Keep pending real-backend query contracts in `src/lib/backendClient.ts`, reusing the managed client and session; do not edit generated database types or create a second auth client while the migration is pending.
- Author MCP in `src/lib/mcp` using the SDK plugin, OAuth caller tokens and owner-scoped queries; generated functions deploy only through app publication.
- Preserve validated same-origin consent return paths through every sign-in method; browser study tools stay in their owning page with shared actions and static telemetry.
- Keep the shared subject catalog independent of browser clients so MCP module imports do not initialize browser auth or read runtime environment.