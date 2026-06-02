# Assignment 2 Report 

---

## What I did

I set up a Jenkins pipeline that automatically builds and tests the same To-Do project whenever code is pushed.

**Application**
- Backend (`backend/`): Express + SQLite, Jest + Supertest tests in `__tests__/`
- Frontend (`frontend/`): React app with its own Jest tests
- Both have `package.json` scripts for `test`, `start`, and `build`

**Jenkins pipeline (`Jenkinsfile`)**
1. Checkout code from GitHub  
2. Backend: `npm install` → `npm test` (with coverage + JUnit report)  
3. Frontend: `npm install` → `npm test` → `npm run build`  
4. Publish HTML coverage reports in Jenkins  
5. Summary stage when the run finishes  

I installed the **NodeJS** tool in Jenkins and connected the job to my public GitHub repo with a webhook on push.

  

---

## Challenges

- **Windows vs Linux:** Jenkins runs `sh` scripts; I used a Linux agent (or WSL) so `npm` commands work.  
- **JUnit plugin:** Tests had to output `junit.xml`; I added `jest-junit` reporter in `package.json`.  
- **Frontend tests:** React tests need `--watchAll=false` in CI or they hang.  
- **Unstable stages:** I used `catchError` so one failing test does not block seeing coverage in the report.

---

## What I learned

- CI means every commit is built and tested automatically, not only on your laptop  
- Jenkins stages make the pipeline easy to read and debug  
- Test reports and coverage help show quality, not just “it compiles”  


