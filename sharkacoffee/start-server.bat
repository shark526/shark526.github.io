@echo off
echo Starting Sharka Coffee Local Server...
echo.
echo Server will start at: http://localhost:8000
echo Press Ctrl+C to stop the server
echo.
python -m http.server 8000
