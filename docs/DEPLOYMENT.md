# Deployment

**Production URL:** https://secondlook-nu.vercel.app  
**Host:** Vercel (Hobby/free tier), project `secondlook` under the `sidd927` account, deployed with the Vercel CLI from the `main` branch.

## What's deployed
| Route | Type | Purpose |
|---|---|---|
| `/` | Static page + client checker | Landing page and single-listing check |
| `/batch` | Static page | Batch screening |
| `/how-it-works` | Static page | Methodology, sources, limits |
| `GET /api/check` | Function | Status (corpus size, data date, AI on/off) + warm-up |
| `POST /api/check` | Function | Check one listing (text and/or image) |
| `POST /api/batch` | Function | Screen up to 200 items (rules engine) |

`data/recalls.json` (the CPSC snapshot) is bundled with the API functions via `outputFileTracingIncludes` in `next.config.ts`. On a cold start, the function fetches recalls published after the snapshot from the CPSC API and caches them for 6 hours.

## Environment variables (Vercel → Project → Settings → Environment Variables)
| Name | Status | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | **Not set (by choice for the submission)** | The app runs the rules engine, labeled "Rules engine (AI off)" in every result |
| `ANTHROPIC_MODEL` | Optional | Defaults to `claude-opus-5-5` |

To enable AI after adding the key: `npx vercel env add ANTHROPIC_API_KEY production`, then `npx vercel deploy --prod`.

## Redeploy
```bash
npx vercel deploy --prod --yes
```

## Verification (Nov 15, 2026)
- `GET /` → 200; `GET /batch` → 200; `GET /how-it-works` → 200
- `GET /api/check` → `{"recalls":7192,"dataAsOf":"2026-11-12","ai":{"enabled":false}}`
- `POST /api/check` with sample listings → correct verdicts, about 0.5 s warm (about 3–4 s on a cold start)
- `POST /api/batch` → 200
- Checked from a public network with no Vercel login, so judges can reach it.
