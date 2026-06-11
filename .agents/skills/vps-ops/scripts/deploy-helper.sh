#!/bin/bash
# ==============================================================================
# VPS Operations & Docker Deploy Helper Script
# ==============================================================================
set -e

# Default branch
BRANCH="master"
CLEANUP=true

usage() {
  echo "Użycie: $0 [opcje]"
  echo "Opcje:"
  echo "  -b, --branch NAZWA   Nazwa gałęzi git do pobrania (domyślnie: master)"
  echo "  -n, --no-prune       Pomiń czyszczenie nieużywanych obrazów docker"
  echo "  -h, --help           Wyświetl tę pomoc"
  exit 1
}

# Parse arguments
while [[ "$#" -gt 0 ]]; do
  case $1 in
    -b|--branch) BRANCH="$2"; shift ;;
    -n|--no-prune) CLEANUP=false ;;
    -h|--help) usage ;;
    *) echo "Nieznana opcja: $1"; usage ;;
  esac
  shift
done

echo "🔄 Rozpoczynam procedurę aktualizacji i wdrożenia..."

# 1. Fetch & Stash
echo "📦 Pobieranie zmian z repozytorium..."
git fetch --all

if ! git diff-index --quiet HEAD --; then
  echo "⚠️ Wykryto lokalne modyfikacje. Zapisuję do stash..."
  git stash
  STASHED=true
else
  STASHED=false
fi

# 2. Checkout & Pull
echo "🔀 Przełączam na gałąź ${BRANCH}..."
git checkout "${BRANCH}"
git pull origin "${BRANCH}"

if [ "$STASHED" = true ]; then
  echo "📦 Przywracam lokalne modyfikacje ze stash..."
  git stash pop || echo "⚠️ Konflikt przy przywracaniu stash. Rozwiąż go ręcznie."
fi

# 3. Environment Check
if [ ! -f .env ]; then
  echo "❌ BŁĄD: Brak pliku .env! Skopiuj .env.example i skonfiguruj zmienne."
  exit 1
fi

# 4. Docker Compose Build & Restart
echo "🏗️ Budowanie i uruchamianie kontenerów..."
docker compose up -d --build

# 5. Cleanup
if [ "$CLEANUP" = true ]; then
  echo "🧹 Czyszczenie nieużywanych obrazów i wolumenów docker..."
  docker system prune -f
fi

echo "✅ Wdrożenie zakończone pomyślnie!"
docker compose ps
