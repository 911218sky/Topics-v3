// npm
import { Router, Request, Response } from "express";
import { config } from "dotenv";
import { v4 as uuidv4 } from "uuid";
import PromiseRouter from "express-promise-router";

// components
import memcached from "../../components/Memcached";
import prisma from "../../components/Prisma";
import Utils from "../../components/Utils";
import Email from "../../components/Email";

config({ path: "../../.env" });

const router = PromiseRouter();

/**
 * @api {post} /forgetpassword 请求重置密码
 * @apiName RequestPasswordReset
 * @apiGroup Public_User
 *
 * @apiBody {String} account 用户的电子邮件或用户名。
 *
 * @apiSuccess (200) {String} message 表示请求成功。
 *
 * @apiSuccessExample 成功响应示例：
 * HTTP/1.1 200 OK
 * {
 *   "message": "请求成功。"
 * }
 *
 * @apiError {String} message 账户错误。
 *
 * @apiErrorExample {json} 错误响应示例：
 * HTTP/1.1 400 Bad Request
 * {
 *   "message": "账户错误。"
 * }
 *
 * @apiError (请求失败 (500)) ServerError 表示服务器内部错误。
 *
 * @apiUse ServerError
 */
router.post("/forgetpassword", async (req: Request, res: Response) => {
  const requiredParams = ["account"];
  if (!Utils.validateParameters(req, requiredParams, "body"))
    return Utils.responseWrongParameter(res);
  const { account } = req.body as {
    account: string;
  };

  const hasId = await memcached.get("USER", account);
  if (hasId) await memcached.del("PUBLIC", hasId);

  prisma.user
    .findFirst({
      where: {
        email: account,
      },
      select: {
        id: true,
      },
    })
    .then(async (user) => {
      if (!user) return Utils.responseWrongParameter(res, "Account error");
      const userId = user.id as number;
      const id = uuidv4();
      await memcached.set("PUBLIC", id, { userId, account });
      await memcached.set("USER", account, id);
      return Email.sendResetPasswordEmail(
        account,
        `${process.env.CLIENT_URL}/restricted/id/${id}/resetpassword`
      ).then((response) => {
        return Utils.responseSuccessfully(res, {
          message: "Please check your mailbox for successful sending",
        });
      });
    })
    .catch((error) => {
      Utils.responseServerError(res, "Fetch failed");
    });
});

/**
 * @api {post} /resetpassword 重置密码
 * @apiName ResetPassword
 * @apiGroup Public_User
 *
 * @apiBody {String} id 重置密码标识符。
 * @apiBody {String} password 用户的新密码。
 *
 * @apiSuccess (200) {String} message 消息表示密码重置成功。
 *
 * @apiSuccessExample 成功响应示例：
 * HTTP/1.1 200 OK
 * {
 *   "message": "密码重置成功。"
 * }
 *
 * @apiError {String} message 表示超过时间或 ID 无效的错误对象。
 *
 * @apiErrorExample {json} 错误响应示例：
 * HTTP/1.1 400 Bad Request
 * {
 *   "message": "超过时间或 ID 无效。"
 * }
 *
 * @apiError (请求失败 (500)) ServerError 表示服务器内部错误。
 *
 * @apiUse ServerError
 */
router.post("/resetpassword", async (req: Request, res: Response) => {
  const requiredParams = ["id", "password"];
  if (!Utils.validateParameters(req, requiredParams, "body"))
    return Utils.responseWrongParameter(res);
  const { id, password } = req.body as {
    id: string;
    password: string;
  };

  const useData = (await memcached.get("PUBLIC", id)) as
    | undefined
    | { userId: string; account: string };
  if (!useData) return Utils.responseWrongParameter(res, "Time exceeded");
  const { userId, account } = useData;

  prisma.user
    .update({
      where: {
        id: +userId,
      },
      data: {
        password: Utils.passowrdHash(password),
      },
    })
    .then(async (response) => {
      await memcached.del("PUBLIC", id);
      await memcached.del("USER", account);
      return Utils.responseSuccessfully(res, {
        message: "Password updated successfully",
      });
    })
    .catch((error) => {
      return Utils.responseServerError(res, "Update failed");
    });
});

export default router;
