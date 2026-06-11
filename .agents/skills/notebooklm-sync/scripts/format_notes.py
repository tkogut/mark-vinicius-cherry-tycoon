#!/usr/bin/env python3
import os
import sys
import json
import shutil
from datetime import datetime

def find_project_root():
    curr = os.getcwd()
    while curr != os.path.dirname(curr):
        if os.path.exists(os.path.join(curr, ".agents")):
            return curr
        curr = os.path.dirname(curr)
    return None

def format_content(raw_text, filename):
    # Basic Markdown formatting if raw text doesn't look like markdown
    lines = raw_text.splitlines()
    formatted_lines = []
    
    # Check if there is already a YAML frontmatter
    has_frontmatter = raw_text.strip().startswith("---")
    
    if not has_frontmatter:
        formatted_lines.append("---")
        formatted_lines.append("tags: [\"#NotebookLM\", \"#ExpertKnowledge\"]")
        formatted_lines.append(f"date_synced: \"{datetime.now().strftime('%Y-%m-%d')}\"")
        formatted_lines.append("---")
        formatted_lines.append("")
        
    title = os.path.splitext(filename)[0].replace("-", " ").replace("_", " ").title()
    if not any(line.strip().startswith("# ") for line in lines):
        formatted_lines.append(f"# {title}")
        formatted_lines.append("")
        
    for line in lines:
        formatted_lines.append(line)
        
    # Append tags at the end if not in frontmatter
    content = "\n".join(formatted_lines)
    if "#NotebookLM" not in content:
        content += "\n\n#NotebookLM #ExpertKnowledge"
        
    return content

def update_graph_json(project_root, kb_relative_path, label):
    graph_path = os.path.join(project_root, ".agents", "specs", "graph.json")
    if not os.path.exists(graph_path):
        print(f"⚠️  Nie znaleziono pliku graph.json w {graph_path}. Pomijam aktualizację grafu.")
        return
        
    try:
        with open(graph_path, "r", encoding="utf-8") as f:
            graph = json.load(f)
    except Exception as e:
        print(f"❌ Błąd podczas odczytu graph.json: {e}")
        return

    # Sprawdź czy węzeł już istnieje
    node_id = kb_relative_path
    node_exists = any(node.get("id") == node_id for node in graph.get("nodes", []))
    
    if not node_exists:
        if "nodes" not in graph:
            graph["nodes"] = []
        graph["nodes"].append({
            "id": node_id,
            "label": label,
            "type": "Expert Knowledge",
            "description": f"Knowledge base note synchronized from NotebookLM: {label}"
        })
        
        # Opcjonalnie stwórz powiązanie (edge) do głównego dokumentu
        if "edges" not in graph:
            graph["edges"] = []
            
        main_doc = ".agents/specs/AGENTS-OS.md"
        edge_exists = any(
            edge.get("source") == main_doc and edge.get("target") == node_id 
            for edge in graph.get("edges", [])
        )
        if not edge_exists:
            graph["edges"].append({
                "source": main_doc,
                "target": node_id,
                "relation": "governs_knowledge"
            })
            
        graph["metadata"]["last_distillation"] = datetime.now().strftime("%Y-%m-%d")
        
        try:
            with open(graph_path, "w", encoding="utf-8") as f:
                json.dump(graph, f, indent=2, ensure_ascii=False)
            print(f"✅ Zaktualizowano graph.json o nowy węzeł: {node_id}")
        except Exception as e:
            print(f"❌ Błąd podczas zapisu graph.json: {e}")

def main():
    project_root = find_project_root()
    if not project_root:
        print("❌ BŁĄD: Nie można zlokalizować głównego katalogu projektu AGENTS-OS.")
        sys.exit(1)
        
    raw_notes_dir = os.path.join(project_root, "raw_notes")
    if len(sys.argv) > 1:
        input_arg = sys.argv[1]
        if os.path.isabs(input_arg):
            raw_notes_dir = input_arg
        else:
            raw_notes_dir = os.path.abspath(os.path.join(project_root, input_arg))
            
    if not os.path.exists(raw_notes_dir):
        print(f"⚠️  Katalog surowych notatek nie istnieje: {raw_notes_dir}")
        print("📁 Tworzę pusty katalog 'raw_notes' w celu przyszłej synchronizacji...")
        os.makedirs(raw_notes_dir, exist_ok=True)
        sys.exit(0)
        
    output_dir = os.path.join(project_root, ".agents", "specs", "knowledge")
    os.makedirs(output_dir, exist_ok=True)
    
    files_to_process = []
    if os.path.isdir(raw_notes_dir):
        for f in os.listdir(raw_notes_dir):
            if f.endswith((".txt", ".md")):
                files_to_process.append(os.path.join(raw_notes_dir, f))
    elif os.path.isfile(raw_notes_dir):
        files_to_process.append(raw_notes_dir)
        
    if not files_to_process:
        print("ℹ️  Brak notatek do przetworzenia w raw_notes.")
        sys.exit(0)
        
    print(f"🚀 Przetwarzanie {len(files_to_process)} notatek...")
    
    for file_path in files_to_process:
        filename = os.path.basename(file_path)
        dest_filename = filename if filename.endswith(".md") else os.path.splitext(filename)[0] + ".md"
        dest_path = os.path.join(output_dir, dest_filename)
        
        # 1. Kopia zapasowa jeśli plik istnieje
        if os.path.exists(dest_path):
            backup_path = dest_path + ".original.md"
            print(f"   💾 Tworzenie kopii zapasowej: {os.path.basename(backup_path)}")
            shutil.copy2(dest_path, backup_path)
            
        # 2. Odczyt i formatowanie
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                raw_text = f.read()
        except Exception as e:
            print(f"   ❌ Nie udało się odczytać {filename}: {e}")
            continue
            
        formatted_md = format_content(raw_text, dest_filename)
        
        # 3. Zapis w folderze wiedzy
        try:
            with open(dest_path, "w", encoding="utf-8") as f:
                f.write(formatted_md)
            print(f"   ✅ Zapisano ustrukturyzowaną notatkę: {dest_filename}")
        except Exception as e:
            print(f"   ❌ Nie udało się zapisać {dest_filename}: {e}")
            continue
            
        # 4. Aktualizacja grafu wiedzy
        rel_kb_path = os.path.relpath(dest_path, project_root)
        label = os.path.splitext(dest_filename)[0].replace("-", " ").replace("_", " ").title()
        update_graph_json(project_root, rel_kb_path, label)

if __name__ == "__main__":
    main()
