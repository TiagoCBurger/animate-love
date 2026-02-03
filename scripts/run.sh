#!/usr/bin/env bash
# Script para rodar comandos do monorepo a partir do diretório raiz

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$ROOT_DIR/next-app"

case "${1:-dev}" in
  dev)
    npm run dev
    ;;
  build)
    npm run build
    ;;
  start)
    npm run start
    ;;
  lint)
    npm run lint
    ;;
  *)
    echo "Uso: $0 {dev|build|start|lint}"
    echo "  dev   - Inicia servidor de desenvolvimento (padrão)"
    echo "  build - Faz o build de produção"
    echo "  start - Inicia servidor de produção"
    echo "  lint  - Executa o linter"
    exit 1
    ;;
esac
