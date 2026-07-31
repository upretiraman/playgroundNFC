# NFC Nürnberg

Website for NFC Nürnberg, a hobby football club for the Nepali community in Nürnberg, Germany — boys' and girls' teams, training schedules, player profiles, news, and club governance.

Built with Next.js (App Router, TypeScript, Tailwind CSS v4). Club/team/player data lives in `src/lib/data/*.json` behind a repository interface (`src/lib/repository.ts`), so it can be swapped for a real database/admin later without touching page code.

## Development

```bash
npm install
npm run dev
```
