---
name: vps-ops
description: Instrukcja i automatyzacja pracy z serwerem VPS, Docker Compose, rebuildami, zmianą branchy i konfiguracją env.
trigger_words: ["vps deploy", "vps setup", "docker-compose rebuild", "deploy production", "setup env vps", "git branch switch vps"]
---

# 🪐 VPS Operations & Docker Deploy (v5.0)

🎯 **Purpose**
Zapewnienie standardu pracy, wdrażania i rozwiązywania problemów na serwerach VPS z użyciem Docker Compose, Git (zmiana gałęzi) oraz konfiguracji plików środowiskowych (`.env`).

🛠️ **Operational Workflow**

### 1. Dostęp i Konfiguracja VPS

> [!IMPORTANT]
> **WSL Agent CLI Isolation**: Agent CLI w WSL działa w osobnym procesie i nie dzieli domyślnie `ssh-agent`. Bez przekazania `SSH_AUTH_SOCK` komendy SSH wiszą.

#### Konfiguracja WSL + Hostinger VPS (tkogut)
* **Host VPS:** `srv1490214.hstgr.cloud`
* **Użytkownik VPS:** `root`
* **Klucz SSH w WSL:** `~/.ssh/tkogut_ssh_key`
* **Źródło klucza Windows:** `/mnt/c/Users/tkogut/.ssh/id_ed25519/tkogut_ssh_key`

#### Krok po kroku:
1. **Import klucza (jednorazowo):**
   ```bash
   cp /mnt/c/Users/tkogut/.ssh/id_ed25519/tkogut_ssh_key ~/.ssh/tkogut_ssh_key
   chmod 600 ~/.ssh/tkogut_ssh_key
   ```
2. **Start agenta i załadowanie klucza:**
   ```bash
   eval $(ssh-agent -s)
   ssh-add ~/.ssh/tkogut_ssh_key
   ```
3. **Pobranie i przekazanie agentowi gniazda:**
   ```bash
   echo "SSH_AUTH_SOCK=$SSH_AUTH_SOCK"
   ```
   *Skopiuj i wklej wartość do czatu agenta.*
4. **Wzór połączenia:**
   ```bash
   SSH_AUTH_SOCK=<gniazdo> ssh -o ConnectTimeout=15 -o StrictHostKeyChecking=no root@srv1490214.hstgr.cloud
   ```

### 2. Środowisko Docker & Docker Compose
*   Aplikacje uruchamiane za pomocą `docker-compose.yml`.
*   Zawsze konfiguruj politykę restartów: `restart: always` lub `restart: unless-stopped`.
*   Zewnętrzne wolumeny dla trwałych danych (bazy danych, logi).

### 3. Zmiana branchy (Git branch swap)
Podczas zmiany gałęzi bezpośrednio na VPS, postępuj według schematu:
1.  **Stash lokalnych zmian** (jeśli na VPS powstały tymczasowe modyfikacje pliku `.env` lub logów):
    ```bash
    git stash
    ```
2.  **Pobranie najnowszego stanu** repozytorium:
    ```bash
    git fetch --all
    ```
3.  **Przełączenie gałęzi** (np. na `main` lub `production`):
    ```bash
    git checkout name-of-branch
    git pull origin name-of-branch
    ```
4.  **Przywrócenie stasha** (opcjonalnie):
    ```bash
    git stash pop
    ```

### 4. Setup Środowiska (`.env`)
*   Plik `.env` **nigdy** nie jest commitowany do repozytorium (musi być w `.gitignore`).
*   Na VPS utwórz plik `.env` ręcznie lub zaktualizuj wartości na podstawie `.env.example`:
    ```bash
    cp .env.example .env
    nano .env
    ```
*   Dla bezpieczeństwa, klucze i hasła produkcyjne generuj z użyciem silnych generatorów (np. `openssl rand -hex 32`).

### 5. Rebuild & Deploy (Wdrożenie/Aktualizacja)
Aby wdrożyć nową wersję kodu bez przestojów lub z minimalnym przestojem:
1.  Pobierz najnowszy kod: `git pull`.
2.  Wymuś przebudowanie obrazów i restart kontenerów w tle:
    ```bash
    docker compose up -d --build
    ```
3.  Wyczyść nieużywane warstwy i obrazy, aby zwolnić miejsce na dysku VPS:
    ```bash
    docker system prune -f
    ```

---

🗣️ **Usage Rules for Agent**
Gdy użytkownik zleci operacje na VPS:
1.  Zidentyfikuj strukturę projektu i sprawdź plik `docker-compose.yml` oraz obecność `.env`.
2.  Użyj dołączonego skryptu `scripts/deploy-helper.sh` do zautomatyzowania procesu wdrażania, jeśli jest dostępny.
3.  Zawsze weryfikuj poprawność uruchomienia kontenerów poprzez `docker compose ps` oraz logi `docker compose logs --tail=50`.
