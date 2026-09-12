@echo off
REM Start n8n with required environment variables
set N8N_SECURE_COOKIE=false
set N8N_USER_MANAGEMENT_DISABLED=true
set N8N_HOST=localhost
set N8N_PORT=5678
set N8N_PROTOCOL=http
n8n start --port=5678