---
name: chmod-ops
description: >
  Manage file and directory permissions safely.
  Trigger: "chmod", "change permissions", "make executable", "set permissions".
---

# 🔑 Chmod Operations (v2.2)

🎯 **Purpose**
Zarządzanie uprawnieniami do plików i katalogów w bezpieczny i ustrukturyzowany sposób.

🛠️ **Implementation Logic**
Logika opiera się na wykonywaniu operacji `chmod` z walidacją ścieżek za pomocą skryptu pomocniczego `scripts/chmod_run.sh`, aby zapobiec modyfikacji krytycznych plików systemowych i katalogów domowych.

Dostępne presety uprawnień:
- `+x` / `755`: Skrypty i pliki wykonywalne.
- `600`: Pliki z kluczami prywatnymi, konfiguracją .env i sekretami.
- `644`: Standardowe pliki źródłowe i dokumentacja.

🗣️ **Usage Rule**
Użyj tego skilla, gdy potrzebujesz nadać uprawnienia wykonywalności dla skryptów (`chmod +x`), zabezpieczyć pliki konfiguracyjne (`chmod 600`), lub zresetować domyślne uprawnienia plików źródłowych.

## Workflow
1. Zidentyfikuj plik/katalog docelowy oraz pożądane uprawnienia.
2. Uruchom skrypt `/home/tkogut/projects/mark-vinicius-cherry-tycoon/.agents/skills/chmod-ops/scripts/chmod_run.sh <ścieżka> <tryb>`.
3. Zweryfikuj uprawnienia za pomocą `ls -la`.
