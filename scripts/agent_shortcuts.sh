#!/bin/bash
# Defines the 'w' (workflow) command and standard aliases for agent workflows in the terminal
# Usage: source scripts/agent_shortcuts.sh

PROJECT_ROOT="$(pwd)" # Use pwd so it depends on where they source it from, or hardcode it
if [[ ! "$PROJECT_ROOT" == *"mark-vinicius-cherry-tycoon"* ]]; then
  PROJECT_ROOT="/home/tkogut/projects/mark-vinicius-cherry-tycoon"
fi
WORKFLOWS_DIR="$PROJECT_ROOT/.agent/workflows"

# 1. The main handler function
function agent() {
    local cmd="$1"
    if [ -z "$cmd" ]; then
        echo -e "\033[1;33mUsage:\033[0m agent <command>"
        echo "Available commands:"
        if [ -d "$WORKFLOWS_DIR" ]; then
            ls -1 "$WORKFLOWS_DIR" | grep '\.md$' | sed 's/\.md$//' | xargs -I {} echo "  - {}"
        fi
        return 1
    fi
    
    local workflow_file="$WORKFLOWS_DIR/$cmd.md"
    if [ -f "$workflow_file" ]; then
        echo -e "\n\033[1;36mWorkflow: /$cmd\033[0m"
        echo "----------------------------------------"
        cat "$workflow_file"
        echo "----------------------------------------"
    else
        echo "❌ Workflow not found: $cmd"
    fi
}

# 2. Setup programmable auto-completion for 'agent'
if [ -d "$WORKFLOWS_DIR" ]; then
    # Get word list
    commands=$(ls -1 "$WORKFLOWS_DIR" 2>/dev/null | grep '\.md$' | sed 's/\.md$//' | tr '\n' ' ')
    # Register the auto-completion rule
    complete -W "$commands" agent
    echo "✅ Agent terminal shortcuts updated! Try typing 'agent che' and press TAB."
else
    echo "❌ Workflows directory not found at $WORKFLOWS_DIR"
fi
