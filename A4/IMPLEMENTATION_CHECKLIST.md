# Assignment 4 Checklist

## Application (2 marks — project structure)

- [x] `A4/app.js` — Node.js backend
- [x] `A4/package.json` — dependencies & scripts
- [x] `A4/__tests__/test_app.js` — unit tests
- [x] `A4/Dockerfile` — containerization

## CI pipeline — build + test (3 marks)

- [x] `.github/workflows/ci.yml`
- [x] Install dependencies step
- [x] Run tests step (`npm test`)

## Tests (2 marks)

- [x] Sample unit test (`1 + 1 === 2`)
- [x] API integration tests with Jest + Supertest

## Deployment automation (2 marks)

- [x] Docker build & push to Docker Hub
- [x] Render deploy webhook on push to `main`
- [ ] Render service created and live

## Documentation (1 mark)

- [x] `README.md` with steps, challenges, learning outcomes
- [ ] Screenshots added
- [ ] Live Render URL filled in
