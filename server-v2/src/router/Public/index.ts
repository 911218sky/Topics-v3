// npm
import { config } from "dotenv";
import PromiseRouter from "express-promise-router";

// Routers
import LimitRouter from "./Limit";
import SystemRouter from "./System";
import UserRouter from "./User";

config({ path: "../../.env" });

const router = PromiseRouter();

router.use("/limit", LimitRouter);
router.use("/system", SystemRouter);
router.use("/user", UserRouter);

export default router;
