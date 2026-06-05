# Business Analytics

Full-stack business analytics platform with an Angular frontend and Spring Boot backend.

## Prerequisites

- **Node.js** 20+ and npm
- **Java** 17+ (set `JAVA_HOME` to your JDK installation)
- **Maven** (included via `backend/mvnw`)

## Project structure

```
frontend/     Angular app (feature modules under src/)
backend/      Spring Boot API (com.analytics)
```

## Run the backend

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

- API base URL: `http://localhost:8080/api`
- H2 console (dev): `http://localhost:8080/h2-console`

### Environment variables

| Variable     | Description                          | Default (dev)        |
|-------------|--------------------------------------|----------------------|
| `JWT_SECRET`| Signing key for JWT (min 32 chars)   | See `application.properties` |

For PostgreSQL, uncomment the PostgreSQL datasource settings in `backend/src/main/resources/application.properties`.

## Run the frontend

```powershell
cd frontend
npm install
npx ng serve
```

- App URL: `http://localhost:4200`
- API URL (dev): `http://localhost:8080/api` (see `frontend/environments/`)

## Build for production

```powershell
cd backend
.\mvnw.cmd -DskipTests package

cd ..\frontend
npx ng build
```

## API endpoints (stubs)

| Path              | Controller           |
|-------------------|----------------------|
| `/api/auth/**`    | Auth (public)        |
| `/api/dashboard`  | Dashboard            |
| `/api/sales`      | Sales                |
| `/api/customers`  | Customers            |
| `/api/finance`    | Finance              |
| `/api/inventory`  | Inventory            |
| `/api/reports`    | Reports              |
| `/api/ai`         | AI insights          |
| `/api/admin`      | Admin                |

Protected routes require a `Bearer` JWT in the `Authorization` header.
