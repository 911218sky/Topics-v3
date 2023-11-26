// npm
import express, { NextFunction, Request, Response } from "express";
import { config } from "dotenv";
import PromiseRouter from "express-promise-router";

// components
import Jwt from "../../components/Jwt";
import Utils from "../../components/Utils";
import LimiteRouter from "./Limite";

config({ path: "../../.env" });
const router = PromiseRouter();

// Type
type ReviseRequest = Utils.UtilsType.RequirementType<
  Request,
  { userId: string },
  {}
>;

router.use(async (req: ReviseRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.token as string | undefined;
  if (!token) return Utils.responseWrongParameter(res);
  Jwt.verifyJwt(token)
    .then((result) => {
      req.userId = result.userId;
      next();
    })
    .catch((error) => {
      Utils.responseWrongParameter(res, "Invalid token");
    });
});

router.use("/limite", LimiteRouter);

// router.post("/revise", (req: ReviseRequest, res: Response) => {});

export default router;
