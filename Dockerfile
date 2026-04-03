# Stage 1: Build frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Stage 2: Final image with Python + nginx
FROM python:3.11-slim

# Install nginx and supervisor
RUN apt-get update && apt-get install -y --no-install-recommends nginx supervisor \
    && rm -rf /var/lib/apt/lists/*

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Setup backend
WORKDIR /app
COPY backend/pyproject.toml backend/uv.lock ./
RUN uv sync --frozen --no-dev
COPY backend/ .

# Copy built frontend
COPY --from=frontend-build /app/dist /usr/share/nginx/html

# Nginx config
COPY nginx.conf /etc/nginx/sites-available/default

# Supervisor config to run both processes
RUN echo '[supervisord]\n\
nodaemon=true\n\
logfile=/dev/null\n\
logfile_maxbytes=0\n\
\n\
[program:gunicorn]\n\
command=uv run gunicorn -b 127.0.0.1:5000 app:app\n\
directory=/app\n\
stdout_logfile=/dev/fd/1\n\
stdout_logfile_maxbytes=0\n\
stderr_logfile=/dev/fd/2\n\
stderr_logfile_maxbytes=0\n\
\n\
[program:nginx]\n\
command=nginx -g "daemon off;"\n\
stdout_logfile=/dev/fd/1\n\
stdout_logfile_maxbytes=0\n\
stderr_logfile=/dev/fd/2\n\
stderr_logfile_maxbytes=0' > /etc/supervisor/conf.d/app.conf

EXPOSE 80

CMD ["supervisord", "-c", "/etc/supervisor/conf.d/app.conf"]
