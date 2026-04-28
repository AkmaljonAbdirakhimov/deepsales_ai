# DeepSales MVP (Temporal-first)

Minimal starter setup for upload-only audio analysis:

- `apps/backend`: Upload endpoint and workflow status/result endpoints
- `apps/temporal`: Temporal worker + workflow + Gemini-powered activities
- `apps/frontend`: React + Vite + shadcn-style UI for upload and result view

## 1) Start Temporal locally

Use Temporal dev server (via Temporal CLI):

```bash
temporal server start-dev
```

Default address used by this project: `localhost:7233`.

## 2) Install dependencies

```bash
npm install
```

## 3) Configure environment

Copy and edit app env files:

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/temporal/.env.example apps/temporal/.env
cp apps/frontend/.env.example apps/frontend/.env
```

Set `GEMINI_API_KEY` in `apps/temporal/.env`.

## 4) Run services

In separate terminals:

```bash
npm run dev:temporal
```

```bash
npm run dev:backend
```

```bash
npm run dev:frontend
```

API runs on `http://localhost:4000`.
Frontend runs on `http://localhost:5173`.

## 5) Test upload

```bash
curl -X POST http://localhost:4000/analyze-upload \
  -F "audio=@/absolute/path/to/sample.wav"
```

Response:

```json
{ "workflowId": "audio-..." }
```

Then:

```bash
curl http://localhost:4000/workflows/<workflowId>/status
curl http://localhost:4000/workflows/<workflowId>/result
```

## Implemented API

- `POST /analyze-upload`
- `GET /workflows/:id/status`
- `GET /workflows/:id/result`
- `GET /health`
