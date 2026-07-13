#!/usr/bin/env bash
# Inventory every file under your Projects folder so two Macs can be compared
# BEFORE turning on iCloud sync. Safe and read-only: it only lists files, it
# never changes, moves, or deletes anything.
#
# Run this on BOTH Macs, then attach both _manifest_*.tsv files in the chat.
#
# Usage:  bash manifest.sh            (defaults to ~/Documents/Projects)
#         bash manifest.sh /some/dir  (inventory a different folder)
set -euo pipefail

ROOT="${1:-$HOME/Documents/Projects}"
[ -d "$ROOT" ] || { echo "Folder not found: $ROOT"; exit 1; }
HOST="$(hostname -s 2>/dev/null || hostname)"
OUT="$HOME/Documents/Projects/_manifest_${HOST}.tsv"

cd "$ROOT"
printf 'path\tsize\tmtime_epoch\tsha256\n' > "$OUT"

# Skip noise: version control internals, dependency caches, build output, OS cruft.
find . -type f \
  -not -path '*/.git/*' \
  -not -path '*/node_modules/*' \
  -not -path '*/.next/*' \
  -not -path '*/dist/*' \
  -not -path '*/build/*' \
  -not -path '*/.cache/*' \
  -not -path '*/_manifest_*' \
  -not -name '.DS_Store' \
  | LC_ALL=C sort | while IFS= read -r f; do
      sz=$(stat -f%z "$f" 2>/dev/null || echo 0)
      mt=$(stat -f%m "$f" 2>/dev/null || echo 0)
      if [ "$sz" -le 104857600 ]; then
        sh=$(shasum -a 256 "$f" 2>/dev/null | awk '{print $1}')
      else
        sh="SKIP-large-${sz}"
      fi
      printf '%s\t%s\t%s\t%s\n' "${f#./}" "$sz" "$mt" "$sh" >> "$OUT"
    done

n=$(( $(wc -l < "$OUT") - 1 ))
echo "Done. Inventoried $n files."
echo "Manifest written to: $OUT"
echo "Attach that file in the chat (do this on both Macs)."
