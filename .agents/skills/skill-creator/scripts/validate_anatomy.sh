#!/bin/bash
# AntiGravity Skill Structure Validator v1.0

SKILLS_DIR=".ai/skills"

for skill in "$SKILLS_DIR"/*/; do
    if [ -d "$skill" ]; then
        skill_name=$(basename "$skill")
        echo "Checking skill: $skill_name"
        
        # Check SKILL.md
        if [ ! -f "$skill/SKILL.md" ]; then
            echo "  [ERROR] Missing SKILL.md"
        fi
        
        # Check folders
        for folder in "scripts" "references" "assets"; do
            if [ ! -d "$skill/$folder" ]; then
                echo "  [WARNING] Missing $folder/ directory"
            fi
        done
    fi
done
