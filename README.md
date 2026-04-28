# DeepSales MVP (Temporal-first)

Minimal starter setup for upload-only audio analysis:

- `apps/backend`: Upload endpoint and workflow status/result endpoints
- `apps/temporal`: Temporal worker + workflow + mock analysis activities
- `apps/frontend`: Reserved for the React frontend app

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

## 3) Run services

In separate terminals:

```bash
npm run dev:temporal
```

```bash
npm run dev:backend
```

API runs on `http://localhost:4000`.

## 4) Test upload

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
