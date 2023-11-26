// npm
import { Router, Request, Response, NextFunction } from "express";
import { config } from "dotenv";
import PromiseRouter from "express-promise-router";

// components
import Jwt from "../../components/Jwt";
import Utils from "../../components/Utils";
import Prisma from "../../components/Prisma";

config({ path: "../../.env" });

const router = PromiseRouter();
type UserRequest = Utils.UtilsType.RequirementType<
  Request,
  { userId: string; role: Utils.UtilsType.Role },
  {}
>;

router.use(async (req: UserRequest, res: Response, next: NextFunction) => {
  const token: string | undefined = req.cookies.token;
  if (!token) return Utils.responseWrongParameter(res, "not logged in");
  Jwt.verifyJwt(token as string)
    .then((results) => {
      req.userId = results.userId;
      next();
    })
    .catch((error) => {
      return Utils.responseWrongParameter(res);
    });
});

/**
 * @api {post} /favorite 加入最喜歡的用戶
 * @apiName UpdateUserFavorite
 * @apiGroup User
 * @apiPermission admin doctor
 * 
 * @apiBody {Number} userId 用户ID，表示要更新的用户的ID。
 * @apiBody {Boolean} isFavorite 指示用户是否应被添加到或移除从收藏列表中。
 * @apiSuccess {String} message 成功消息。
 * 
 * @apiErrorExample 错误响应示例:
 *     HTTP/1.1 400 Bad Request
 *     {
 *         "message": "参数不正确或缺失。"
 *     }
 *
 * @apiError {String} message 错误消息，指示用户权限不足。

 * @apiErrorExample 权限不足响应示例:
 *     HTTP/1.1 403 Forbidden
 *     {
 *         "message": "您没有足够的权限。"
 *     }
 *
 * @apiSuccessExample 成功响应示例:
 *     HTTP/1.1 200 OK
 *     {
 *         "message": "更新成功。"
 *     }
 *
 * @apiErrorExample 更新失败响应示例:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *         "message": "更新失败。"
 *     }
 * 
 * @apiError {String} message 错误消息。
 * @apiUse ServerError
 */
router.post("/favorite", async (req: UserRequest, res: Response) => {
  const requiredParams = ["userId", "isFavorite"];
  if (!Utils.validateParameters(req, requiredParams, "body"))
    return Utils.responseWrongParameter(res);
  if (!Utils.checkPermission(req.role!))
    return Utils.responseWrongParameter(
      res,
      "You don't have enough authority."
    );
  const { userId: favoriteUserId, isFavorite } = req.body as {
    userId: number;
    isFavorite: boolean;
  };

  const userId = +req.userId!;

  if (isFavorite) {
    Prisma.user
      .update({
        where: {
          id: userId,
        },
        data: {
          favoriteUsers: {
            connect: {
              id: favoriteUserId,
            },
          },
        },
      })
      .then((user) => {
        return Utils.responseSuccessfully(res, {
          message: "update completed",
        });
      })
      .catch((error) => {
        return Utils.responseServerError(res, "Update failed");
      });
  } else {
    Prisma.user
      .update({
        where: {
          id: userId,
        },
        data: {
          favoriteUsers: {
            disconnect: {
              id: favoriteUserId,
            },
          },
        },
      })
      .then((user) => {
        return Utils.responseSuccessfully(res, {
          message: "update completed",
        });
      })
      .catch((error) => {
        return Utils.responseServerError(res, "Update failed");
      });
  }
});

export default router;
