---
description: How to run long-running commands with persistent logging for AntiGravity visibility.
---

# Command Logging Protocol (v1.0)

Aby uniknąć długiego oczekiwania na `command_status`, stosujemy przekierowanie do logów w `/tmp/`.

## Kroki:

1. **Uruchamianie**:
   Zawsze przekierowuj `stdout` i `stderr` do unikalnego pliku logu.
   ```bash
   PYTHONPATH=. python3 execution/my_script.py > /tmp/my_script.log 2>&1 &
   ```

2. **Monitorowanie**:
   Użyj `view_file` (z `StartLine` na ostatnich liniach), aby sprawdzić postęp, lub `tail` w terminalu.
   ```bash
   tail -n 20 /tmp/my_script.log
   ```

3. **Status**:
   Sprawdzaj istnienie procesu lub końcowy wpis w logu (np. "SUCCESS").

// turbo-all
## Przykład (Auditor):
1. `PYTHONPATH=. python3 execution/auditor_check.py > /tmp/auditor.log 2>&1 &`
2. `cat /tmp/auditor.log`
