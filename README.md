# PlanBoard

A shareable todo board app. No login required — create a board, get a unique link, and share it with anyone.

Forked and refactored from [Plan-Me](https://github.com/ivaZaiets/Plan-Me) by [@ivaZaiets](https://github.com/ivaZaiets).

## Stack

- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS
- **Backend:** Python, Flask, SQLAlchemy, SQLite
- **Packaging:** Docker Compose

## Quick Start

```bash
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000).

## Development

### Backend

```bash
cd backend
uv run python app.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```
