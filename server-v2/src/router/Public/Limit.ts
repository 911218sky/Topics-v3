// npm
import { Router, Request, Response } from "express";
import { config } from "dotenv";
import PromiseRouter from "express-promise-router";

// components
import memcached from "../../components/Memcached";
import Utils from "../../components/Utils";
import Jwt from "../../components/Jwt";

config({ path: "../../.env" });

const router = PromiseRouter();

/**
 * @api {post} /exist 检查是否存在
 * @apiName CheckExistence
 * @apiGroup Public_Limit
 *
 * @apiBody {String} id 检查是否存在的 ID。
 *
 * @apiSuccess {Boolean} exist 表示 ID 是否存在于缓存中。
 *
 * @apiSuccessExample 成功响应示例：
 * HTTP/1.1 200 OK
 * {
 *    "exist": true
 * }
 *
 *  @apiUse ServerError
 */
router.post("/exist", async (req: Request, res: Response) => {
  const requiredParams = ["id"];
  if (!Utils.validateParameters(req, requiredParams, "body"))
    return Utils.responseWrongParameter(res);
  const id = req.body.id as string;
  return Utils.responseSuccessfully(res, {
    exist:
      !!(await memcached.get("PUBLIC", id)) ||
      !!(await memcached.get("USER", id)),
  });
});

export default router;
