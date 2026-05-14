# Backend OCP LubriControl

## Lancement

1. Copier `.env.example` vers `.env` et ajuster `DATABASE_URL`.
2. Démarrer PostgreSQL.
3. Exécuter:

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

API: `http://localhost:4000/api`  
Swagger: `http://localhost:4000/docs`

## Compte seed

- email: `admin@ocp.ma`
- mot de passe: `admin123`

## Endpoints principaux

- `POST /api/auth/login`
- `GET /api/dashboard/kpis`
- `GET /api/lubrifiants`
- `GET /api/interventions`
- `POST /api/import/interventions` (multipart/form-data, champ `file`)
- `GET /api/export/lubrifiants?format=xlsx|csv`
- `GET /api/analytics/pareto`
- `PUT /api/settings/theme`

## Exemple d'appel depuis Next.js

```ts
const login = await fetch("http://localhost:4000/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "admin@ocp.ma", password: "admin123" }),
});
const { token } = await login.json();

const kpis = await fetch("http://localhost:4000/api/dashboard/kpis", {
  headers: { Authorization: `Bearer ${token}` },
});
const data = await kpis.json();
```
