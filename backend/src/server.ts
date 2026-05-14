import app from "./app";
import { env } from "./config/env";

app.listen(env.PORT, env.HOST, () => {
  console.log(`Backend API listening on http://${env.HOST}:${env.PORT}`);
  console.log(`Health: http://localhost:${env.PORT}/health`);
  console.log(`Swagger docs: http://localhost:${env.PORT}/docs`);
});
