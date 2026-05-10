# Product Verification Service

A standalone microservice for specification end-to-end verification with an integrated React frontend.

## Quick Start

### Run the Service

```bash
# Using uvicorn directly
uvicorn main:app --host 0.0.0.0 --port 8083 --reload

# Or using python
python main.py
```

The service will be available at `http://localhost:8083`

## Development

### Frontend Development

```bash
cd frontend
bun install
bun run dev
```

### Build Frontend

```bash
cd frontend
bun run build
```

Build output goes to `api/static/` and is served by FastAPI at `/static`.

## API Endpoints

- `GET /` - React frontend (SPA)
- `GET /api/health` - Health check
- `GET /api/v1/spec-suites` - List test suites
- `POST /api/v1/verifications` - Trigger new run
- `GET /api/v1/verifications` - List runs
- `GET /api/v1/verifications/{id}` - Get run details
- `GET /api/v1/verifications/{id}/log` - Get run log
- `GET /api/v1/verifications/{id}/report` - Get run report
- `GET /api/v1/verifications/{id}/screenshots` - List screenshots

## Environment

Copy `.env.example` to `.env` and configure:
- `PORT` - Service port (default: 8083)
- `HOST` - Service host (default: 0.0.0.0)
- `OUTPUT_DIR` - Test output directory
- `OLLAMA_HOST` - Ollama API endpoint
- `DATABASE_URL` - SQLite database path
