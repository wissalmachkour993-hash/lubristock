import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";

import authRoutes from "./routes/auth.routes";
import lubricantRoutes from "./routes/lubricants.routes";
import interventionsRoutes from "./routes/interventions.routes";
import equipmentsRoutes from "./routes/equipments.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import alertsRoutes from "./routes/alerts.routes";
import importExportRoutes from "./routes/import-export.routes";
import analyticsRoutes from "./routes/analytics.routes";
import settingsRoutes from "./routes/settings.routes";
import planningRoutes from "./routes/planning.routes";
import predictionRoutes from "./routes/prediction.routes";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";

const app = express();
const swaggerDocument = YAML.load(path.join(__dirname, "config", "swagger.yaml"));

app.use(cors());
app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/lubrifiants", lubricantRoutes);
app.use("/api/interventions", interventionsRoutes);
app.use("/api", equipmentsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/alerts", alertsRoutes);
app.use("/api", importExportRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/planning", planningRoutes);
app.use("/api/predictions", predictionRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
