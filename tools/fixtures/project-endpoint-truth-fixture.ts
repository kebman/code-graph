export interface VirtualFixtureFile {
  readonly filePath: string;
  readonly sourceText: string;
}

export const PROJECT_BACKEND_FIXTURE_FILES: readonly VirtualFixtureFile[] = [
  {
    filePath: "src/app.ts",
    sourceText: `
import express from "express";
import ordersRouter from "./routes/orderRoutes";

const app = express();

app.use("/api/orders", ordersRouter);

export default app;
`,
  },
  {
    filePath: "src/routes/orderRoutes.ts",
    sourceText: `
import { Router } from "express";

export function getOrder() {}
export function refundOrder() {}
export function reconcileOrders() {}

export const adminRouter = Router();
adminRouter.post("/reconcile", reconcileOrders);

const ordersRouter = Router();
ordersRouter.get("/:id", getOrder);
ordersRouter.post("/:id/refund", refundOrder);
ordersRouter.use("/admin", adminRouter);

export default ordersRouter;
`,
  },
];

export const PROJECT_CONSUMER_FIXTURE_FILES: readonly VirtualFixtureFile[] = [
  {
    filePath: "src/e2e/orders.e2e.test.ts",
    sourceText: `
import request from "supertest";

declare const app: unknown;
declare const orderId: string;
declare const paymentUrl: string;

const createOrderPath = "/api/orders";
const refundPath = \`/api/orders/\${orderId}/refund\`;

async function run() {
  await request(app).post(createOrderPath).send({});
  await request(app).get(\`/api/orders/\${orderId}\`);
  await request(app).post(refundPath).set("Authorization", "Bearer test");
  await request(app).get("/api/missing");
  await request(app).get(paymentUrl);
}
`,
  },
];
