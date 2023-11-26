// npm
import crypto from "crypto";
import express, { Request, Response, NextFunction } from "express";
import PromiseRouter from "express-promise-router";
import { config } from "dotenv";
import lodash from "lodash";

// components
import prisma from "../../components/Prisma";
import Jwt from "../../components/Jwt";
import Utils from "../../components/Utils";
import type * as FormType from "../../components/type/FormType";

// type
type FormRequest = Utils.UtilsType.RequirementType<
  Request,
  { userId: string; role: Utils.UtilsType.Role },
  {}
>;

type FormRequestRequired = Utils.UtilsType.RequirementType<
  Request,
  {},
  { userId: string; role: Utils.UtilsType.Role }
>;

config({ path: "../../.env" });
const router = PromiseRouter();

router.use(async (req: FormRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.token;
  if (!token) return Utils.responseWrongParameter(res, "No token");
  await Jwt.verifyJwt(token)
    .then((result) => {
      req.userId = result.userId;
      req.role = result.role;
      next();
    })
    .catch((error) => {
      return Utils.responseWrongParameter(res, "Verification failed");
    });
});

/**
 * @api {post} /upload 上传表单
 * @apiName UploadForm
 * @apiGroup Form
 * @apiPermission doctor
 * @apiPermission admin
 *
 * @apiBody  {Object} form 表格数据。
 * @apiBody  {String} form.formName 表格名稱。
 * @apiBody  {Boolean} form.isSingleChoice 表格是否单选。
 * @apiBody  {Boolean} form.isRandomized 表格是否乱数。
 * @apiBody  {Object[]} form.questions 表格问题列表。
 * @apiBody  {string} form.questions.question 表格问题。
 * @apiBody  {string[]} form.questions.options 表格选项。
 *
 * @apiBody  {Number[][]} form.correctAnswer 表格正确答案。
 *
 * @apiSuccess {String} message 上传成功消息。
 *
 * @apiSuccessExample 成功响应示例：
 * HTTPS/1.1 200 OK
 * {
 *   "message": "表单上传成功！"
 * }
 *
 * @apiError InvalidParameter 提供的参数无效。
 * @apiError NoAuthority 没有足够权限执行操作。
 * @apiError UploadFailed 上传表单失败。
 *
 * @apiErrorExample {json} 错误响应示例：
 * HTTPS/1.1 403 Forbidden
 * {
 *   "error": "NoAuthority",
 *   "message": "没有足够权限执行操作。"
 * }
 */
router.post("/upload", async (__req: FormRequest, res: Response) => {
  const req = __req as FormRequestRequired;
  const requiredParams = ["form"];
  if (!Utils.checkPermission(req.role!))
    return Utils.responseWrongParameter(
      res,
      "You don't have enough authority."
    );
  if (!Utils.validateParameters(req, requiredParams, "body"))
    return Utils.responseWrongParameter(res, "form error");
  const userId = req.userId as string;
  const { formName, isSingleChoice, isRandomized, questions, correctAnswer } =
    req.body.form as FormType.uploadFormDataType;
  if (
    formName === null ||
    isSingleChoice === null ||
    isRandomized === null ||
    questions === null ||
    correctAnswer === null
  )
    return Utils.responseWrongParameter(res);

  const key = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);

  prisma.form
    .create({
      data: {
        formName: formName,
        isRandomized: isRandomized,
        isSingleChoice: isSingleChoice,
        questions: JSON.stringify(questions),
        correctAnswer: JSON.stringify(correctAnswer),
        key: key,
        iv: iv,
        author: { connect: { id: +userId } },
      },
    })
    .then((result) => {
      return Utils.responseSuccessfully(res, {
        message: "uploaded successfully",
      });
    })
    .catch((error) => {
      return Utils.responseWrongParameter(res, "Upload failed");
    });
});

/**
 * @api {get} /specify 获取表格详细信息
 * @apiName GetFormDetails
 * @apiGroup Form
 * @apiPermission authenticated user
 *
 * @apiQuery {String} fid 表单 ID。
 *
 * @apiSuccess {String} message 获取成功信息。
 *
 * @apiSuccess {Object[]} questions 问题列表。
 * @apiSuccess {string} questions.question 问题文本。
 * @apiSuccess {string[]} questions.options 问题的选项列表。
 *
 * @apiSuccess {String} formIndex 加密表单索引。
 * @apiSuccess {Boolean} isSingleChoice 表示表单是否为单选。
 * @apiSuccess {String} formName 表单名称。
 * @apiSuccess {Number} fid 表单 ID。
 *
 * @apiSuccessExample 成功响应示例：
 * HTTPS/1.1 200 OK
 * {
 *   "message": "获取成功！",
 *   "questions": [
 *     {
 *       "question": "您的年龄是？",
 *       "options": ["18岁以下", "18-30岁", "31-45岁", "46岁以上"]
 *     },
 *     {
 *       "question": "您的职业是？",
 *       "options": ["学生", "上班族", "自由职业者", "其他"]
 *     }
 *   ],
 *   "formIndex": "5a7e1b29c4b2e1a4f0ce7ec8",
 *   "isSingleChoice": true,
 *   "formName": "调查问卷",
 *   "fid": 123
 * }
 *
 * @apiError InvalidParameter 提供的参数无效。
 * @apiError QueryFailed 查询表单详细信息失败。
 *
 * @apiErrorExample {json} 错误响应示例：
 * HTTPS/1.1 400 Bad Request
 * {
 *   "error": "InvalidParameter",
 *   "message": "提供的参数无效。"
 * }
 */
router.get("/specify", async (req: FormRequest, res: Response) => {
  const requiredParams = ["fid"];
  if (!Utils.validateParameters(req, requiredParams, "query"))
    return Utils.responseWrongParameter(res);
  const { fid } = req.query as { fid: string };
  prisma.form
    .findUnique({
      where: {
        id: +fid,
      },
      select: {
        id: true,
        formName: true,
        key: true,
        iv: true,
        isRandomized: true,
        isSingleChoice: true,
        questions: true,
      },
    })
    .then((form) => {
      if (!form) {
        Utils.responseWrongParameter(res, "Query failed");
        return;
      }
      const { id, key, iv, formName, isSingleChoice, isRandomized } = form!;
      const questions = <FormType.questionsType[]>(
        JSON.parse(form.questions as string)
      );
      const formIndex: FormType.shuffledIndex[] = questions.map(
        (question, indxe) => {
          return [indxe, question.options.map((_, index) => index)];
        }
      );
      const shuffledIndex: FormType.shuffledIndex[] = lodash.shuffle(
        formIndex.map((v) => [v[0], lodash.shuffle(v[1] as number[])])
      );
      const newQuestions = isRandomized
        ? shuffledIndex.map((item) => {
          const questionIndex = item[0];
          const optionsIndex = item[1];
          return {
            question: questions[questionIndex].question,
            options: optionsIndex.map((optionIndex) => {
              return questions[questionIndex].options[optionIndex];
            }),
          };
        })
        : questions;

      const encryptionFormIndex = Utils.encryption(
        isRandomized
          ? JSON.stringify(shuffledIndex)
          : JSON.stringify(formIndex),
        key,
        iv
      );

      return Utils.responseSuccessfully(res, {
        message: "Get success",
        questions: newQuestions,
        formIndex: encryptionFormIndex,
        isSingleChoice,
        formName,
        fid: id,
      });
    })
    .catch((error) => {
      return Utils.responseWrongParameter(res, "Query failed");
    });
});

/**
 * @api {get} /information 获取表单信息
 * @apiName GetFormInformation
 * @apiGroup Form
 * @apiPermission authenticated user
 *
 * @apiQuery {Number} [startPage=1] 开始页码。
 * @apiQuery {Number{1-10}} [piece=7] 多少信息。
 * @apiQuery {String} [searchFormName] 搜索页码。
 * @apiQuery {String[]} [searchAuthor] 搜索作者。
 *
 * @apiSuccess {String} message 获取成功信息。
 *
 * @apiSuccess {Object[]} forms 表单信息列表。
 * @apiSuccess {number} forms.id 表格 ID。
 * @apiSuccess {String} forms.formName 表格名称。
 * @apiSuccess {Date} forms.formCreateTime 表单创建时间。
 *
 * @apiSuccess {Object} forms.author 表单作者信息。
 * @apiSuccess {String} forms.author.userName 作者的用户名。
 * @apiSuccess {String|null} forms.author.imgId 作者的图片 ID。
 *
 * @apiSuccess {String} message 成功信息。
 * @apiSuccess {Number} totalPages 页面总数。
 *
 * @apiSuccessExample 成功响应示例：
 * HTTPS/1.1 200 OK
 * {
 *   "message": "获取成功！",
 *     "forms": [
 *       {
 *         "id": 1,
 *         "formName": "调查问卷",
 *         "formCreateTime": "2023-08-01T12:00:00.000Z",
 *         "author": {
 *           "userName": "exampleUser",
 *           "imgId": "abc123"
 *         }
 *       },
 *       // 更多表单信息...
 *     ],
 *     "totalPages": 5
 * }
 *
 * @apiError InvalidParameter 提供的参数无效。
 * @apiError FetchFailed 获取表单信息失败。
 *
 * @apiErrorExample {json} 错误响应示例：
 * HTTPS/1.1 400 Bad Request
 * {
 *   "error": "InvalidParameter",
 *   "message": "提供的参数无效。"
 * }
 */
router.get("/information", async (req: FormRequest, res: Response) => {
  const startPage = Math.max(
    1,
    !isNaN(Number(req.query.startPage)) ? Number(req.query.startPage) : 1
  );

  const searchFormName = (req.query.searchFormName || undefined) as
    | string
    | undefined;
  const searchAuthor = (req.query.searchAuthor || undefined) as
    | string[]
    | undefined;

  if (
    (typeof searchFormName !== "string" && searchFormName !== undefined) ||
    (searchAuthor !== undefined &&
      (!Array.isArray(searchAuthor) ||
        !searchAuthor.every((item) => typeof item === "string")))
  )
    return Utils.responseWrongParameter(res);

  const rawPiece = Number(req.query.piece);
  const piece = isNaN(rawPiece) || rawPiece < 1 || rawPiece > 10 ? 7 : rawPiece;

  const totalPages = Math.ceil(
    (await prisma.form.count({
      where: {
        formName: {
          contains: searchFormName,
        },
        author: {
          userName: {
            in: searchAuthor,
          },
        },
      },
    })) / piece
  );

  if (startPage > totalPages)
    return Utils.responseWrongParameter(res, "no data");

  prisma.form
    .findMany({
      select: {
        id: true,
        formName: true,
        formCreateTime: true,
        author: {
          select: {
            imgId: true,
            userName: true,
          },
        },
      },
      where: {
        formName: {
          startsWith: searchFormName,
        },
        author: {
          userName: {
            in: searchAuthor,
          },
        },
      },
      orderBy: {
        formCreateTime: "desc",
      },
      skip: piece * (startPage - 1),
      take: piece,
    })
    .then((forms) => {
      return Utils.responseSuccessfully(res, {
        message: "Get success",
        forms,
        totalPages,
      });
    })
    .catch((error) => {
      return Utils.responseServerError(res, "Fetch failed");
    });
});

/**
 * @api {get} /author 获取所有表格作者
 * @apiName GetFormAuthors
 * @apiGroup Form
 * @apiPermission authenticated user
 *
 * @apiSuccess {String} message 获取成功信息。
 * @apiSuccess {Object[]} author 作者信息列表。
 * @apiSuccess {String} author.userName 作者用户名。
 * @apiSuccess {String} author.imgId 作者图片 ID。
 *
 * @apiSuccessExample 成功响应示例：
 * HTTPS/1.1 200 OK
 * {
 *   "message": "获取成功！",
 *   "author": [
 *     {
 *       "userName": "author1",
 *       "imgId": "img123"
 *     },
 *     {
 *       "userName": "author2",
 *       "imgId": "img456"
 *     },
 *     // 更多作者信息...
 *   ]
 * }
 *
 * @apiError FetchFailed 获取表单作者失败。
 *
 * @apiErrorExample {json} 错误响应示例：
 * HTTPS/1.1 500 Internal Server Error
 * {
 *   "error": "FetchFailed",
 *   "message": "获取表单作者失败。"
 * }
 */
router.get("/author", async (req: FormRequest, res: Response) => {
  prisma.form
    .findMany({
      select: {
        author: {
          select: {
            userName: true,
            imgId: true,
          },
        },
      },
      distinct: ["authorId"],
    })
    .then((author) => {
      return Utils.responseSuccessfully(res, {
        message: "Get success",
        author: author.map((item) => {
          return {
            userName: item.author.userName,
            imgId: item.author.imgId,
          };
        }),
      });
    })
    .catch((error) => {
      return Utils.responseServerError(res, "Fetch failed");
    });
});

/**
 * @api {post} /verify 验证表单
 * @apiName VerifyForm
 * @apiGroup Form
 * @apiPermission authenticated user
 *
 * @apiBody  {Number} fid 表单 ID。
 * @apiBody  {Number[][]} answers 用户的答案。
 * @apiBody  {String} formIndex 加密表单索引。
 *
 * @apiSuccess {String} message 验证成功信息。
 * @apiSuccess {Number} score 获取分数。
 *
 * @apiSuccessExample 成功响应示例：
 * HTTPS/1.1 200 OK
 * {
 *   "message": "表单验证成功！"
 * }
 *
 * @apiError InvalidParameter 提供的参数无效。
 * @apiError AddFailed 添加验证历史失败。
 *
 * @apiErrorExample {json} 错误响应示例：
 * HTTPS/1.1 400 Bad Request
 * {
 *   "error": "InvalidParameter",
 *   "message": "提供的参数无效。"
 * }
 */
router.post("/verify", async (req: FormRequest, res: Response) => {
  const requiredParams = ["fid", "answers", "formIndex"];
  if (!Utils.validateParameters(req, requiredParams, "body"))
    return Utils.responseWrongParameter(res);
  const { fid, answers, formIndex } = req.body as FormType.verifyFormType;
  const userId = req.userId as string;
  prisma.form
    .findUnique({
      where: {
        id: +fid,
      },
      select: {
        key: true,
        iv: true,
        correctAnswer: true,
        formName: true,
      },
    })
    .then((form) => {
      if (!form) {
        Utils.responseWrongParameter(res, "Query failed");
        return;
      }
      const { key, iv } = form!;
      const correctAnswer = <number[][]>(
        JSON.parse(form.correctAnswer as string)
      );
      const errorQuestionIndex: number[] = [];
      const errorAnswerIndexs: number[][] = [];
      const decryptFormIndex: FormType.shuffledIndex[] = JSON.parse(
        Utils.decrypt(formIndex, key, iv)
      );
      const avgScore = Math.round((100 / correctAnswer.length) * 10) / 10;
      const score = decryptFormIndex.reduce((score: number, item, index) => {
        const questionIndex = item[0];
        const optionsIndex = item[1];
        const newAnswerIndex = answers[index]
          .map((answer) => {
            return optionsIndex[answer];
          })
          .sort((a, b) => a - b);
        if (
          newAnswerIndex.length === correctAnswer[questionIndex].length &&
          newAnswerIndex.every((answer, index) => {
            return answer === correctAnswer[questionIndex][index];
          })
        )
          score += avgScore;
        else {
          errorQuestionIndex.push(index);
          errorAnswerIndexs.push(answers[index]);
        }
        return score;
      }, 0);
      return prisma.historyForm.create({
        data: {
          user: { connect: { id: +userId } },
          form: { connect: { id: +fid } },
          formName: form.formName,
          errorAnswerIndexs: JSON.stringify(errorAnswerIndexs),
          errorQuestionIndex: JSON.stringify(errorQuestionIndex),
          score: Math.ceil(score),
          formQuestAnswerIndex: formIndex,
        },
      });
    })
    .then((history) => {
      if (!history) {
        Utils.responseWrongParameter(res, "Add failed");
        return;
      }
      return Utils.responseSuccessfully(res, {
        message: `You score : ${history.score}`,
        score: history.score,
      });
    })
    .catch((error) => {
      return Utils.responseWrongParameter(res, "Add failed");
    });
});

export default router;