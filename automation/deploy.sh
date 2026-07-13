#!/usr/bin/env bash
# Deploy the live site (site/src) to Vercel production.
# No zip needed: Vercel's REST API takes individual files by hash, which is
# faster and more reliable than a zip upload. Wraps deploy_vercel_fallback.py.
#
# Usage:  automation/deploy.sh
# Token:  reads VERCEL_TOKEN from the environment, or sources it from
#         vercel.env in your credentials dir. Set WER_CREDENTIALS to override
#         where that lives; default is ~/Documents/Projects/Home/credentials.
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$REPO/site/src"
[ -d "$SRC" ] || { echo "no site/src at $SRC"; exit 1; }

if [ -z "${VERCEL_TOKEN:-}" ]; then
  CRED="${WER_CREDENTIALS:-$HOME/Documents/Projects/Home/credentials}/vercel.env"
  [ -f "$CRED" ] || { echo "no VERCEL_TOKEN in env and no $CRED"; exit 1; }
  # shellcheck disable=SC1090
  set -a; . "$CRED"; set +a
fi
export VERCEL_TOKEN

python3 -c 'import requests' 2>/dev/null || pip install --quiet --break-system-packages requests
exec python3 "$REPO/automation/deploy_vercel_fallback.py" "$SRC"
