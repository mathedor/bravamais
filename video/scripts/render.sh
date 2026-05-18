#!/usr/bin/env bash
# Render do vídeo BRAVA+. Aceita arg da composition (default: usuario).
# Detecta automaticamente se public/music.mp3 existe e passa withMusic=true.
#
# Uso:
#   npm run render                # apresentacao-usuario
#   npm run render -- usuario     # idem
#   bash scripts/render.sh usuario out/custom.mp4

set -euo pipefail

cd "$(dirname "$0")/.."

KIND="${1:-usuario}"
case "$KIND" in
  usuario|user|assinante)        COMPOSITION="apresentacao-usuario" ;;
  lojista|loja|estab)            COMPOSITION="apresentacao-lojista" ;;
  entregador|motoboy|delivery)   COMPOSITION="apresentacao-entregador" ;;
  comercial|representante|sales) COMPOSITION="apresentacao-comercial" ;;
  *)                             COMPOSITION="$KIND" ;;
esac

OUTPUT="${2:-out/$COMPOSITION.mp4}"
mkdir -p "$(dirname "$OUTPUT")"

if [ -f "public/music.mp3" ]; then
  echo "✓ music.mp3 detectado — renderizando com trilha"
  PROPS='{"withMusic":true}'
else
  echo "⚠ public/music.mp3 ausente — vídeo sai sem trilha"
  PROPS='{"withMusic":false}'
fi

echo "→ Composition: $COMPOSITION"
echo "→ Output: $OUTPUT"

exec node_modules/.bin/remotion render src/index.ts "$COMPOSITION" "$OUTPUT" \
  --concurrency=2 \
  --props="$PROPS"
