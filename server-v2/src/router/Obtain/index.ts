import express, { Request, Response, NextFunction } from "express";
import PromiseRouter from "express-promise-router";
import { promises as fsPromises } from "fs";
import { v4 as uuidv4 } from "uuid";
import { config } from "dotenv";
import fs from "fs";

// components
import memcached from "../../components/Memcached";
import Jwt from "../../components/Jwt";
import Utils from "../../components/Utils";
import prisma from "../../components/Prisma";

// type
import type * as FormType from "../../components/type/FormType";

config({ path: "../../.env" });
const router = PromiseRouter();
type ObtainRequest = Utils.UtilsType.RequirementType<
  Request,
  { userId: string },
  {}
>;

router.use(async (req: ObtainRequest, res: Response, next: NextFunction) => {
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
 * @apiDefine ServerError
 *
 * @apiError (请求失败 (500)) ServerError 服務器錯誤。
 * @apiErrorExample {json} 错误响应示例：
 * HTTPS/1.1 500 Internal Server Error
 * {
 *   "error": "ServerError",
 *   "message": "服務器錯誤。"
 * }
 */

/**
 * @api {get} /information 获取用户信息
 * @apiName GetUserInformation
 * @apiGroup Obtain
 * @apiPermission authenticatedUser
 *
 * @apiSuccess {String} message 成功消息。
 * @apiSuccess {Object} user 用户信息。
 * @apiSuccess {String} user.email 用户的电子邮件地址。
 * @apiSuccess {String} user.userName 用户的用户名。
 * @apiSuccess {String|null} user.imgId 用户个人资料图片的 ID。
 * @apiSuccess {String} user.appellation 用户的称谓。
 * @apiSuccess {String} user.role 用户的角色。
 *
 * @apiSuccessExample 成功响应示例：
 * HTTPS/1.1 200 OK
 * {
 *   "message": "获取用户信息成功。",
 *   "user": {
 *     "email": "user@example.com",
 *     "userName": "JohnDoe",
 *     "imgId": "img123",
 *     "appellation": "Mister",
 *     "role": "user"
 *   }
 * }
 *
 * @apiUse ServerError
 */
router.get("/information", async (req: ObtainRequest, res: Response) => {
  const userId = req.userId as string;
  prisma.user
    .findUnique({
      where: {
        id: +userId,
      },
      select: {
        email: true,
        userName: true,
        imgId: true,
        appellation: true,
        role: true,
      },
    })
    .then((user) => {
      return Utils.responseSuccessfully(res, {
        message: "search successful",
        user: user,
      });
    })
    .catch((error) => {
      return Utils.responseServerError(res, "Inquire user error");
    });
});

/**
 * @api {get} /user/image/:id 获取用户图像
 * @apiName GetUserImage
 * @apiGroup Obtain
 * @apiPermission authenticatedUser
 *
 * @apiParam {String} id 用户图像 ID。
 *
 * @apiSuccess {File} image 用户的个人资料图片。
 *
 * @apiError NotFound 文件未找到。
 *
 * @apiErrorExample {json} 错误响应示例：
 * HTTPS/1.1 404 Not Found
 * {
 *   "error": "NotFound",
 *   "message": "文件未找到。"
 * }
 */
router.get("/user/image/:id", async (req: ObtainRequest, res: Response) => {
  const requiredParams = ["id"];
  if (!Utils.validateParameters(req, requiredParams, "params"))
    return Utils.responseWrongParameter(res);
  const { id } = req.params as { id: string };

  const isDefault = id.includes("__SYSTEM");
  const imagePath = isDefault
    ? `./system/image/userlmg/${id}`
    : `./uploads/image/${id}`;

  fsPromises
    .access(imagePath)
    .then(() => {
      return fsPromises.readFile(imagePath);
    })
    .then((data) => {
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.setHeader("Content-Type", "image/jpeg");
      res.setHeader("Content-Length", data.length);
      res.send(data);
    })
    .catch((error) => {
      res.status(404).send({ message: "File not found." });
    });
});

/**
 * @api {get} /defaultuserpicture 获取默认用户图片列表
 * @apiName GetDefaultUserPicture
 * @apiGroup Obtain
 * @apiPermission authenticatedUser
 *
 * @apiSuccess {Object} data 获取默认用户图片成功。
 * @apiSuccess {String} data.message 操作成功的消息。
 * @apiSuccess {String[]} data.imageFiles 默认用户图片文件列表。
 *
 * @apiError NotFound 未找到文件夹或没有默认用户图片。
 *
 * @apiErrorExample {json} 错误响应示例：
 * HTTPS/1.1 404 Not Found
 * {
 *   "error": "NotFound",
 *   "message": "未找到文件夹或没有默认用户图片。"
 * }
 */
router.get("/defaultuserpicture", async (req: ObtainRequest, res: Response) => {
  const directoryPath = "./system/image/userlmg";
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      Utils.responseServerError(res, "Error reading folder");
      return;
    }
    const imageFiles = files.filter((file) => {
      return (
        file.endsWith(".jpg") || file.endsWith(".png") || file.endsWith(".jpeg")
      );
    });
    Utils.responseSuccessfully(res, {
      message: "Get success",
      imageFiles,
    });
  });
});

/**
 * @api {post} /reviselimitetoken 修订限制令牌
 * @apiName ReviseLimitToken
 * @apiGroup Obtain
 * @apiPermission authenticatedUser
 *
 * @apiBody {String} password 用户密码。
 *
 * @apiSuccess {String} id 新令牌 ID。
 *
 * @apiSuccessExample 成功响应示例：
 * HTTPS/1.1 200 OK
 * {
 *   "id": "new_token_id"
 * }
 *
 * @apiError WrongParameter 提供了错误的参数。
 *
 * @apiErrorExample {json} 错误响应示例：
 * HTTPS/1.1 400 Bad Request
 * {
 *   "error": "WrongParameter",
 *   "message": "提供了错误的参数。"
 * }
 *
 * @apiError Unauthorized 未授权验证失败。
 *
 * @apiErrorExample {json} 错误响应示例：
 * HTTPS/1.1 401 Unauthorized
 * {
 *   "error": "Unauthorized",
 *   "message": "未授权验证失败。"
 * }
 *
 * @apiUse ServerError
 */
router.post("/reviselimitetoken", async (req: ObtainRequest, res: Response) => {
  const requiredParams = ["password"];
  if (!Utils.validateParameters(req, requiredParams, "body"))
    return Utils.responseWrongParameter(res);
  const userId = req.userId as string;
  const password = req.body.password as string;
  Utils.verifyPassword(userId, password)
    .then(async (result) => {
      if (!result)
        return Utils.responseWrongParameter(res, "verification failed");
      const uuid = uuidv4();
      await memcached.set("USER", uuid, { userId });
      Utils.responseSuccessfully(res, { message: "successfully", id: uuid });
    })
    .catch(() => {
      return Utils.responseServerError(res, "verification failed");
    });
});

/**
 * @api {get} /history 获取用户历史表单
 * @apiName GetUserHistoryForms
 * @apiGroup Obtain
 * @apiPermission authenticatedUser
 *
 * @apiParam {String} [token=""] 用于分页的用户令牌。
 *
 * @apiSuccess {Object[]} history 用户的历史表单。
 * @apiSuccess {Number} history.id 历史表单 ID。
 * @apiSuccess {String} history.formName 历史表单名称。
 * @apiSuccess {Number} history.score 与历史表单相关的分数。
 * @apiSuccess {Number} history.formId 原始表单的 ID。
 * @apiSuccess {Date} history.historyFormCreateTime 创建历史表单的日期和时间。
 *
 * @apiSuccess {String} token 用于分页的新令牌。
 * @apiSuccess {Boolean} isEnd 表示是否已获取所有历史表单。
 *
 * @apiSuccessExample 成功响应示例：
 * HTTPS/1.1 200 OK
 * {
 *   "history": [
 *     {
 *       "id": 1,
 *       "formName": "表单名称",
 *       "score": 85,
 *       "formId": 123,
 *       "historyFormCreateTime": "2023-08-28T12:34:56Z"
 *     },
 *     // 更多历史表单...
 *   ],
 *   "token": "new_pagination_token",
 *   "isEnd": false
 * }
 *
 * @apiUse ServerError
 */
router.get("/history", async (req: ObtainRequest, res: Response) => {
  const token = req.query.token;
  const userId = req.userId as string;
  const once = 5;
  let start = 0;
  try {
    if (token) {
      const data = await Jwt.verifyJwt(token as string);
      start = data.start;
    }
  } catch {}
  prisma.user
    .findUnique({
      where: {
        id: +userId,
      },
      select: {
        historyForm: {
          select: {
            id: true,
            formName: true,
            formId: true,
            score: true,
            historyFormCreateTime: true,
          },
          orderBy: {
            historyFormCreateTime: "desc",
          },
          skip: start,
          take: once,
        },
      },
    })
    .then((historyForm) => {
      const token = Jwt.generateJwt(
        {
          start: start + once,
        },
        "6h"
      );
      return Utils.responseSuccessfully(res, {
        message: "search successful",
        history: historyForm?.historyForm,
        token,
        isEnd: historyForm ? historyForm.historyForm.length < once : true,
      });
    })
    .catch((error) => {
      return Utils.responseServerError(res, "Query error");
    });
});

/**
 * @api {get} /historydetails/:hid 获取历史表单详情
 * @apiName GetHistoryFormDetails
 * @apiGroup Obtain
 * @apiPermission authenticatedUser
 *
 * @apiParam {Number} hid 历史表单 ID。
 *
 * @apiSuccess {Object[]} historyForm 历史表单中的问题和答案。
 * @apiSuccess {String} historyForm.question 问题文本。
 * @apiSuccess {String[]} historyForm.options 问题的选项列表。
 * @apiSuccess {Boolean} historyForm.isError 表示问题是否回答错误。
 * @apiSuccess {Number[]|null} historyForm.errorAnswerIndexs 错误答案索引。
 * @apiSuccess {Number[]|null} historyForm.correctAnswerIndexs 正确答案索引。
 *
 * @apiSuccess {String} formName 原始表单的名称。
 * @apiSuccess {Boolean} isSingleChoice 表示表单是否为单选题。
 *
 * @apiSuccessExample 成功响应示例：
 * HTTPS/1.1 200 OK
 * {
 *    "historyForm": [
 *      {
 *        "question": "问题文本",
 *        "options": ["选项1", "选项2", "选项3"],
 *        "isError": true,
 *        "errorAnswerIndexs": [1],
 *        "correctAnswerIndexs": [2]
 *      },
 *      // 更多问题...
 *    ],
 *    "formName": "原始表单名称",
 *    "isSingleChoice": true
 * }
 *
 * @apiError BadRequest 无效参数。
 *
 * @apiErrorExample {json} 错误响应示例：
 * HTTPS/1.1 400 Bad Request
 * {
 *   "error": "BadRequest",
 *   "message": "无效参数。"
 * }
 *
 * @apiError Unauthorized 用户无权访问此数据。
 *
 * @apiErrorExample {json} 错误响应示例：
 * HTTPS/1.1 401 Unauthorized
 * {
 *   "error": "Unauthorized",
 *   "message": "用户无权访问此数据。"
 * }
 *
 * @apiUse ServerError
 */
router.get(
  "/historydetails/:hid",
  async (req: ObtainRequest, res: Response) => {
    const requiredParams = ["hid"];
    if (!Utils.validateParameters(req, requiredParams, "params"))
      return Utils.responseWrongParameter(res);
    const { hid } = req.params as { hid: string };
    const userId = req.userId || -1;
    prisma.historyForm
      .findUnique({
        where: {
          id: +hid,
          userId: +userId,
        },
        select: {
          formName: true,
          form: {
            select: {
              questions: true,
              correctAnswer: true,
              key: true,
              iv: true,
              isSingleChoice: true,
            },
          },
          errorAnswerIndexs: true,
          errorQuestionIndex: true,
          formQuestAnswerIndex: true,
          userId: true,
        },
      })
      .then((historyForm) => {
        if (!historyForm || userId !== historyForm.userId)
          return Utils.responseWrongParameter(res, "not id");
        const errorAnswerIndexs = JSON.parse(
          historyForm.errorAnswerIndexs
        ) as number[][];
        const errorQuestionIndex = JSON.parse(
          historyForm.errorQuestionIndex
        ) as number[];
        const formQuestAnswerIndex = JSON.parse(
          Utils.decrypt(
            historyForm.formQuestAnswerIndex,
            historyForm.form.key,
            historyForm.form.iv
          )
        ) as FormType.shuffledIndex[];

        const questions = JSON.parse(
          historyForm.form.questions as string
        ) as FormType.questionsType[];

        const correctAnswer = JSON.parse(
          historyForm.form.correctAnswer as string
        ) as number[][];

        const correctAnswerIndexs = correctAnswer.map(
          (correctAnswer, questionIndex) => {
            const shuffledQuestionIndex =
              formQuestAnswerIndex.find(
                (shuffledIndex) => shuffledIndex[0] === questionIndex
              )?.[1] || [];
            const answerIndices = correctAnswer.map((answer) =>
              shuffledQuestionIndex.indexOf(answer)
            );
            return answerIndices;
          }
        );

        const newQuestions = formQuestAnswerIndex.map((qo, index) => {
          const question = questions[qo[0]].question;
          const options = qo[1].map(
            (optionIndex: number) => questions[qo[0]].options[optionIndex]
          );
          const isError = errorQuestionIndex.includes(index);

          return {
            question: question,
            options: options,
            isError: isError,
            errorAnswerIndexs: isError ? errorAnswerIndexs.shift() : null,
            correctAnswerIndexs: !isError ? correctAnswerIndexs[qo[0]] : null,
          };
        });

        return Utils.responseSuccessfully(res, {
          message: "search successful",
          historyForm: newQuestions,
          formName: historyForm.formName,
          isSingleChoice: historyForm.form.isSingleChoice,
        });
      })
      .catch((error) => {
        return Utils.responseServerError(res, "Query error");
      });
  }
);

/**
 * @api {get} /users 获取用户
 * @apiName GetUsers
 * @apiGroup Obtain
 * @apiPermission authenticatedUser
 *
 * @apiParam {Number} [startPage=1] 分页的起始页。
 * @apiParam {String} [searchUserName] 搜索以指定文本开头的用户名。
 *
 * @apiSuccess {Object[]} users 用户列表。
 * @apiSuccess {Number} users.id 用户 ID。
 * @apiSuccess {String} users.userName 用户的用户名。
 * @apiSuccess {String|null} users.imgId 用户的图像 ID。
 * @apiSuccess {String} users.role 用户的角色。
 * @apiSuccess {Number[]|null} users.favoriteUsers 收藏用户 ID 列表。
 *
 * @apiSuccess {Number} totalPages 可用于分页的页面总数。
 *
 * @apiSuccessExample 成功响应示例：
 * HTTPS/1.1 200 OK
 * {
 *    "users": [
 *      {
 *        "id": 1,
 *        "userName": "用户1",
 *        "imgId": "user_image_id",
 *        "role": "user"
 *      },
 *      // 更多用户...
 *    ],
 *    "totalPages": 5,
 * }
 *
 * @apiError BadRequest 无效参数。
 *
 * @apiErrorExample {json} 错误响应示例：
 * HTTPS/1.1 400 Bad Request
 * {
 *   "error": "BadRequest",
 *   "message": "无效参数。"
 * }
 *
 * @apiUse ServerError
 */
router.get("/users", async (req: ObtainRequest, res: Response) => {
  const startPage = Math.max(
    1,
    !isNaN(Number(req.query.startPage)) ? Number(req.query.startPage) : 1
  );
  const searchUserName = (req.query.searchUserName || undefined) as
    | string
    | undefined;

  const once = 8;

  const totalPages = Math.ceil(
    (await prisma.user.count({
      where: {
        userName: {
          startsWith: searchUserName,
        },
      },
    })) / once
  );

  if (startPage > totalPages) return Utils.responseWrongParameter(res);

  const users = await prisma.user.findMany({
    where: {
      userName: {
        startsWith: searchUserName,
      },
    },
    select: {
      id: true,
      userName: true,
      imgId: true,
      role: true,
    },
    skip: once * (startPage - 1),
    take: once,
  });

  return Utils.responseSuccessfully(res, {
    message: "Get success",
    users,
    totalPages,
  });
});

/**
 * @api {get} /favoriteusers 获取收藏用户
 * @apiName GetFavoriteUsers
 * @apiGroup Obtain
 * @apiPermission authenticatedUser
 *
 * @apiSuccess {Number[]} favoriteUsers 已验证用户的收藏用户 ID 列表。
 *
 * @apiSuccessExample 成功响应示例：
 * HTTPS/1.1 200 OK
 * {
 *   "favoriteUsers": [2, 3, 5]
 * }
 *
 * @apiError BadRequest 无效参数。
 *
 * @apiErrorExample {json} 错误响应示例：
 * HTTPS/1.1 400 Bad Request
 * {
 *   "error": "BadRequest",
 *   "message": "无效参数。"
 * }
 *
 * @apiUse ServerError
 */
router.get("/favoriteusers", (req: ObtainRequest, res: Response) => {
  const userId = req.userId!;
  prisma.user
    .findUnique({
      where: {
        id: +userId,
      },
      select: {
        favoriteUsers: {
          select: {
            id: true,
          },
        },
      },
    })
    .then((favoriteUsers) => {
      return Utils.responseSuccessfully(res, {
        message: "Get success",
        favoriteUsers: favoriteUsers?.favoriteUsers.map(({ id }) => id),
      });
    })
    .catch((error) => {
      return Utils.responseWrongParameter(res, "Enquiry failure");
    });
});

export default router;
