// npm
import express, { NextFunction, Request, Response } from "express";
import path from "path";
import fs from "fs";
import { config } from "dotenv";
import PromiseRouter from "express-promise-router";

// components
import prisma from "../../components/Prisma";
import memcached from "../../components/Memcached";
import Storage, { upload } from "../../components/Storage";
import Utils from "../../components/Utils";

config({ path: "../../.env" });
const router = PromiseRouter();

// Type
type LimiteRequest = Utils.UtilsType.RequirementType<
  Request,
  { userId: string },
  {}
>;

router.use(async (req: LimiteRequest, res: Response, next: NextFunction) => {
  const id = req.query.id;
  const requiredParams = ["id"];
  if (!(Utils.validateParameters(req, requiredParams, "body") || id))
    return Utils.responseWrongParameter(res, "NO ID");
  const userData = (await memcached.get("USER", id as string)) as
    | undefined
    | { userId: number };
  if (!userData) {
    return Utils.responseWrongParameter(res, "Invalid limiteToken");
  } else {
    next();
  }
});

/**
 * @api {get} /verify 验证限制令牌
 * @apiName VerifyLimiteToken
 * @apiGroup Revise_Limite
 *
 * @apiSuccess (200) {Object} data 空数据对象，表示令牌验证成功。
 *
 * @apiSuccessExample 成功响应示例：
 * HTTPS/1.1 200 OK
 *
 * @apiError (400) {String} message 错误对象表示令牌无效或丢失。
 *
 * @apiErrorExample {json} 错误响应示例：
 * HTTPS/1.1 400 Bad Request
 * {
 *   "message": "令牌无效或丢失。"
 * }
 */
router.get("/verify", async (req: LimiteRequest, res: Response) => {
  return Utils.responseSuccessfully(res);
});

/**
 * @api {post} /update 更新用户配置文件
 * @apiName UpdateUserProfile
 * @apiGroup Revise_Limite
 *
 * @apiHeader {String} Content-Type 文件上传使用 "multipart/form-data"。
 * @apiHeaderExample {curl} 示例请求头:
 *     Content-Type: multipart/form-data
 *
 * @apiBody {String} [user] 新用户名。
 * @apiBody {String} [Password] 新用户密码。
 * @apiBody {File} [image] 用户配置文件图像。
 * @apiBody {String} [systemImageId] 使用系統自帶頭像。
 *
 * @apiSuccess {String} message 消息表示用户配置文件更新成功。
 *
 * @apiSuccessExample 成功响应示例：
 * HTTPS/1.1 200 OK
 * {
 *   "message": "用户配置文件更新成功。"
 * }
 *
 * @apiError {String} message 错误对象表示参数无效或数据缺失。
 *
 * @apiErrorExample {json} 错误响应示例：
 * HTTPS/1.1 400 Bad Request
 * {
 *   "message": "参数无效或数据缺失。"
 * }
 *
 * @apiUse ServerError
 */
router.post(
  "/update",
  upload.single("image"),
  async (req: LimiteRequest, res: Response) => {
    const userId = req.userId as string;
    const { userName, password, systemImageId } = req.body as {
      userName: string | undefined;
      password: string | undefined;
      systemImageId: string | undefined;
    };

    const newData = {
      password: password ? Utils.passowrdHash(password) : undefined,
      userName: userName ? userName : undefined,
      imgId: systemImageId ? systemImageId : undefined,
    };

    if (req.file) {
      const imgSizeInMb = req.file.size / 1000000;
      const imgId =
        imgSizeInMb < 1.5
          ? path.basename(req.file.path)
          : await Storage.resizeImage(req.file);
      Object.assign(newData, { imgId });
    }

    prisma.user
      .findUnique({ where: { id: +userId } })
      .then((user) => {
        if (!user) {
          Utils.responseWrongParameter(res);
          return;
        }
        if (
          req.file &&
          user?.imgId &&
          fs.existsSync(`./uploads/image/${user.imgId}`)
        ) {
          fs.unlink(`./uploads/image/${user.imgId}`, (err) => {
            if (err) console.log(err);
            else console.log(`File ${user.imgId} has been deleted`);
          });
        }
        return prisma.user.update({
          where: {
            id: +userId,
          },
          data: newData,
        });
      })
      .then((user) => {
        Utils.responseSuccessfully(res, { message: "update completed" });
      })
      .catch((error) => {
        return Utils.responseServerError(res, "operating failed");
      });
  }
);

export default router;
