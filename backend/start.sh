#!/bin/bash

# Start Python FastAPI server in the background
# We provide a different port for Python (8000) or let it use default
# Note: Railway only exposes the $PORT variable, so we need a way to 
# make the main process (Node) the one that Railway talks to, 
# and then Node can proxy requests to Python.
# OR we run them on different ports and the frontend calls them directly.
# BUT Railway only allows ONE exposed port.

echo "Starting Python API server..."
python api_server.py &

echo "Starting Node.js main server..."
node server.js
