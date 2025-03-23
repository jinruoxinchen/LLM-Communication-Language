#!/bin/bash
echo "Starting LLM-CL Educational Demonstration server..."
echo "Open your browser and navigate to http://localhost:8000"

# Check for Python version
if command -v python3 &>/dev/null; then
    python3 -m http.server 8000
elif command -v python &>/dev/null; then
    python -m http.server 8000
else
    echo "Error: Python is not installed. Please install Python to run the server."
    exit 1
fi
