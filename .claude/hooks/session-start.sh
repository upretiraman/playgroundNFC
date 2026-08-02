#!/bin/bash
# Best-effort environment bootstrap for the NFC Nürnberg site.
# Idempotent, non-interactive, and never blocks session start — each step
# is skipped if already done, and a failure is reported but doesn't abort
# the rest of the script or fail the hook.
set -uo pipefail

cd "$CLAUDE_PROJECT_DIR" || exit 0

step() {
  local desc="$1"
  shift
  echo "[session-start] $desc"
  if ! "$@"; then
    echo "[session-start] WARNING: '$desc' failed — continuing anyway" >&2
  fi
}

if [ ! -x node_modules/.bin/next ]; then
  step "Installing npm dependencies" npm install
fi

if [ ! -f .env ]; then
  step "Creating .env from .env.example" cp .env.example .env
fi

if [ ! -f src/generated/prisma/client.ts ]; then
  step "Generating Prisma client" npx prisma generate
fi

if [ ! -f dev.db ]; then
  step "Applying database migrations" npx prisma migrate deploy
fi

# Idempotent: upserts by fixed ID / checks for an existing admin before
# creating one, so it's safe (and cheap) to run on every session start.
step "Seeding database" npx prisma db seed

echo "[session-start] Bootstrap complete."
exit 0
