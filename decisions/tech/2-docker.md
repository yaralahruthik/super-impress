# Docker

We used `Next.js` for v0; Docker was optional there. We are introducing a Python `FastAPI` backend now, which benefits strongly from containerization for consistency and onboarding.

The `SvelteKit` frontend can run natively but may use Docker for parity.

This is also a learning opportunity for the community to get hands-on Docker experience across backend and frontend contexts.

We will be using `docker-compose` to orchestrate both the services.
The `Dockerfiles` are not yet optimized but they are a decent starting point.

## Current Setup

**Backend**: Python FastAPI container on port `8000`  
**Frontend**: SvelteKit container on port `5173`  
**Orchestration**: Docker Compose with custom `app` network for service communication

## Future Optimizations

Multi-stage builds to reduce image sizes: <200MB backend, <50MB frontend
