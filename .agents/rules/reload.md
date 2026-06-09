---
trigger: always_on
---

Rule: Web App Auto-Restart
Description: Whenever any Python, TypeScript, React or HTML/CSS file changes, trigger the server reload.
Activation: Glob
Pattern: **/*.{py,html,js,tsx}

Instruction: 
Antigravity Agent, whenever a file matching the pattern is modified, automatically invoke the terminal command to restart the web application.
