# NFC Nürnberg

Website for NFC Nürnberg, a hobby football club for the Nepali community in Nürnberg, Germany — boys' and girls' teams, training schedules, player profiles, news, and club governance.

Built with Next.js (App Router, TypeScript, Tailwind CSS v4). Club/team/player content lives in `src/lib/data/*.json` behind a repository interface (`src/lib/repository.ts`), so it can be swapped for a real database/admin later without touching page code.

The site also has a member area (`/login`, `/dashboard/**`) with role-based access — Guest (public, no login), Player, Trainer, and Administrator — backed by Prisma + SQLite and NextAuth (Auth.js). Trainers/Admins schedule trainings and games, set training plans, and mark attendance; Players see their team's schedule and their own attendance.

## Development

```bash
npm install
cp .env.example .env        # then edit AUTH_SECRET if needed
npx prisma migrate dev      # creates the local SQLite database
npx prisma db seed          # creates a bootstrap Administrator account (prints its password once)
npm run dev
```

Log in with the printed Administrator credentials at `/login`, then create Player/Trainer accounts from `/dashboard/users`.
