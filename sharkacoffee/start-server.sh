#!/bin/bash
echo "Starting Sharka Coffee Local Server..."
echo ""
echo "Server will start at: http://localhost:8000"
echo "Press Ctrl+C to stop the server"
echo ""
python3 -m http.server 8000
