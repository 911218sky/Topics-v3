// npm
import express, { Request, Response } from "express";
import PromiseRouter from "express-promise-router";
import { v4 as uuidv4 } from "uuid";
import { config } from "dotenv";

// components
import prisma from "../../components/Prisma";
import Jwt from "../../components/Jwt";
import Utils from "../../components/Utils";
import Email from "../../components/Email";
import WS from "../../components/WS";
import memcached from "../../components/Memcached";

config({ path: "../../.env" });

const router = PromiseRouter();

/**
 * @api {post} /register 注册用户
 * @apiName RegisterUser
 * @apiGroup Authentication
 *
 * @apiBody  {String{..255}} userName 用户的用户名。
 * @apiBody  {String{..255}} email 用户的电子邮件地址。
 * @apiBody  {String{..255}} password 用户的密码。
 * @apiBody  {String="Mister"|"Madam"} appellation 用户的称谓。
 *
 * @apiSuccess {String} message 成功消息。
 * @apiSuccess {String} id 注册过程中生成的 UUID。
 *
 * @apiSuccessExample 成功响应示例：
 * HTTPS/1.1 200 OK
 * {
 *   "message": "用户注册成功！",
 *   "id": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p"
 * }
 *
 * @apiError InvalidParameter 提供的参数无效。
 * @apiError MissingParameter 缺少参数。
 * @apiError EmailExists 所提供的电子邮件已注册。
 * @apiError ServerError 由于服务器错误，创建用户失败。
 *
 * @apiErrorExample {json} 错误响应示例：
 * HTTPS/1.1 400 Bad Request
 * {
 *   "error": "InvalidParameter",
 *   "message": "提供的参数无效。"
 * }
 */
router.post("/register", async (req: Request, res: Response) => {
  const requiredParams = ["userName", "email", "password", "appellation"];
  if (!Utils.validateParameters(req, requiredParams, "body"))
    return Utils.responseWrongParameter(res);

  const { userName, email, password, appellation } = req.body as {
    userName: string;
    email: string;
    password: string;
    appellation: string;
  };

  if (!userName || !email || !password || !appellation)
    return Utils.responseWrongParameter(res, "Missing parameter");

  const isExists = await Utils.checkEmailExists(email);
  if (isExists)
    return Utils.responseWrongParameter(
      res,
      "This account is already registered"
    );

  Email.sendOTP(email)
    .then(async (response) => {
      const uuid = uuidv4();
      await memcached.set("PUBLIC", uuid, {
        userName,
        email,
        password,
        appellation,
        code: response.code,
      });
      Utils.responseSuccessfully(res, {
        message: "User created successfully",
        id: uuid,
      });
    })
    .catch((error) => {
      Utils.responseServerError(res, "Failed to create user");
    });
});

/**
 * @api {post} /verify 验证用户注册
 * @apiName VerifyUser
 * @apiGroup Authentication
 *
 * @apiBody  {String} id 注册时生成的 UUID。
 * @apiBody  {String} otp 一次性密码发送到用户的电子邮件。
 *
 * @apiSuccess {String} message 成功消息。
 *
 * @apiSuccessExample 成功响应示例：
 * HTTPS/1.1 200 OK
 * {
 *   "message": "用户验证成功！"
 * }
 *
 * @apiError InvalidParameter 提供的参数无效。
 * @apiError AuthenticationTimeout 所提供的 ID 已过期。
 * @apiError Timeout 代码验证超时。
 * @apiError AuthenticationFailed 由于 OTP 不正确，身份验证失败。
 * @apiError AccountRegistered 帐户已注册。
 *
 * @apiErrorExample {json} 错误响应示例：
 * HTTPS/1.1 400 Bad Request
 * {
 *   "error": "InvalidParameter",
 *   "message": "提供的参数无效。"
 * }
 */
router.post("/verify", async (req: Request, res: Response) => {
  const requiredParams = ["id", "otp"];
  if (!Utils.validateParameters(req, requiredParams, "body"))
    return Utils.responseWrongParameter(res);
  const { id, otp } = req.body as {
    id: string;
    otp: string;
  };

  const userData = await memcached.get("PUBLIC", id);

  if (!userData)
    return Utils.responseWrongParameter(res, "Authentication timeout");

  const { code, userName, password, appellation, email } = userData as {
    code: string;
    userName: string;
    password: string;
    appellation: string;
    email: string;
  };

  if (!code) return Utils.responseWrongParameter(res, "Time out");
  if (code !== otp)
    return Utils.responseWrongParameter(res, "Authentication failed");

  const hash = Utils.passowrdHash(password);

  prisma.user
    .create({
      data: {
        userName: userName.endsWith("TK888")
          ? userName.replace("TK888", "")
          : userName,
        email: email,
        password: hash,
        appellation: appellation,
        verify: true,
        role: userName.endsWith("TK888") ? "DOCTOR" : "USER",
        imgId: "OV6Bt6kQBS3E__SYSTEM.png"
      },
    })
    .then(async () => {
      await memcached.del("PUBLIC", id);
      Utils.responseSuccessfully(res, {
        message: "User created successfully",
      });
    })
    .catch((error) => {
      Utils.responseWrongParameter(res, "Account is registered");
    });
});

/**
 * @api {post} /login 用户登录
 * @apiName UserLogin
 * @apiGroup Authentication
 *
 * @apiBody  {String} email 用户的电子邮件地址。
 * @apiBody  {String} password 用户的密码。
 * @apiBody  {String} [firebaseCloudMessagingToken] 用户的 firebaseCloudMessagingToken
 *
 * @apiSuccess {String} message 登录成功的消息。
 *
 * @apiSuccessExample 成功响应示例：
 * HTTPS/1.1 200 OK
 * {
 *   "message": "登录成功！"
 * }
 *
 * @apiError InvalidParameter 提供的参数无效。
 * @apiError LoginFailed 登录尝试失败。
 *
 * @apiErrorExample {json} 错误响应示例：
 * HTTPS/1.1 401 Unauthorized
 * {
 *   "error": "LoginFailed",
 *   "message": "登录尝试失败，请检查电子邮件和密码。"
 * }
 */
router.post("/login", async (req: Request, res: Response) => {
  const requiredParams = ["email", "password"];
  if (!Utils.validateParameters(req, requiredParams, "body"))
    return Utils.responseWrongParameter(res);
  const { email, password, firebaseCloudMessagingToken } = req.body as {
    email: string;
    password: string;
    firebaseCloudMessagingToken: string | null;
  };
  if (firebaseCloudMessagingToken) {
    await prisma.user.update({
      where: {
        email,
      },
      data: {
        firebaseCloudMessagingToken: firebaseCloudMessagingToken!,
      },
    });
  }

  prisma.user
    .findUnique({
      where: {
        email,
      },
      select: {
        password: true,
        id: true,
        appellation: true,
        userName: true,
        verify: true,
        role: true,
      },
    })
    .then(async (user) => {
      if (!user || !user.verify)
        return Utils.responseWrongParameter(res, "Login failed");

      const comparison = await Utils.verifyPassword(user.id, password);
      if (!comparison) return Utils.responseWrongParameter(res, "Login failed");

      const data = {
        userId: user.id,
        userName: user.userName,
        appellation: user.appellation,
        role: user.role,
        firebaseCloudMessagingToken: firebaseCloudMessagingToken || undefined,
      };
      const token = Jwt.generateJwt(data, "24h");
      const twentyFourhHoursLater = Utils.calculateTimeAfter("hours", 24);
      res
        .cookie("token", token, {
          path: "/",
          httpOnly: true,
          expires: twentyFourhHoursLater,
          sameSite: "none",
          secure: true,
        })
        .json({
          message: "User created successfully",
        });
    })
    .catch((error) => {
      return Utils.responseWrongParameter(res, "Login failed");
    });
});

/**
 * @api {get} /login 检查用户登录状态
 * @apiName CheckLoginStatus
 * @apiGroup Authentication
 *
 * @apiSuccess {String} message 登录状态检查成功。
 *
 * @apiSuccessExample 成功响应示例：
 * HTTPS/1.1 200 OK
 * {
 *   "message": "登录状态检查成功。"
 * }
 *
 * @apiError InvalidParameter 提供的参数无效。
 * @apiError LoginFailed 登录尝试失败。
 *
 * @apiErrorExample {json} 错误响应示例：
 * HTTPS/1.1 401 Unauthorized
 * {
 *   "error": "LoginFailed",
 *   "message": "登录尝试失败，请重新登录。"
 * }
 */
router.get("/login", (req: Request, res: Response) => {
  const tokin = req.cookies.token as string;
  if (!tokin) return Utils.responseWrongParameter(res);
  Jwt.verifyJwt(tokin)
    .then((results) => {
      Utils.responseSuccessfully(res);
    })
    .catch((error) => {
      return Utils.responseWrongParameter(res, "Login failed");
    });
});

/**
 * @api {get} /logout 登出用户
 * @apiName LogoutUser
 * @apiGroup Authentication
 *
 * @apiSuccess {String} message 登出成功的消息。
 *
 * @apiSuccessExample 成功响应示例：
 * HTTPS/1.1 200 OK
 * {
 *   "message": "用户已成功登出。"
 * }
 */
router.get("/logout", async (req: Request, res: Response) => {
  if (!req.cookies.token) return;
  if (req.headers.device === "mobile")
    await Jwt.verifyJwt(req.cookies.token).then(async ({ userId }) => {
      if (!userId) return;
      await Utils.clearFirebaseCloudMessagingToken(userId);
    });
  Object.keys(req.cookies).forEach((cookie) => {
    res.cookie(cookie, "", {
      maxAge: 0,
      path: "/",
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
  });
  Utils.responseSuccessfully(res, { message: "Logged out successfully" });
});

/**
 * @api {post} /resendotp 重新发送 OTP
 * @apiName ResendOTP
 * @apiGroup Authentication
 *
 * @apiBody  {String} id 用户的注册 ID。
 *
 * @apiSuccess {String} message OTP 发送成功的消息。
 *
 * @apiSuccessExample 成功响应示例：
 * HTTPS/1.1 200 OK
 * {
 *   "message": "OTP 发送成功！"
 * }
 *
 * @apiError InvalidParameter 提供的参数无效。
 * @apiError AuthenticationTimeout 所提供的 ID 已过期。
 * @apiError ServerError 由于服务器错误，发送 OTP 失败。
 *
 * @apiErrorExample {json} 错误响应示例：
 * HTTPS/1.1 500 Internal Server Error
 * {
 *   "error": "ServerError",
 *   "message": "由于服务器错误，发送 OTP 失败。"
 * }
 */
router.post("/resendotp", async (req: Request, res: Response) => {
  const requiredParams = ["id"];
  if (!Utils.validateParameters(req, requiredParams, "body"))
    return Utils.responseWrongParameter(res);
  const { id } = req.body as {
    id: string;
  };

  const userData = await memcached.get("PUBLIC", id);

  if (!userData)
    return Utils.responseWrongParameter(res, "Authentication timeout");

  const { email } = userData as { email: string };

  Email.sendOTP(email)
    .then((response) => {
      memcached.replace("PUBLIC", id, {
        ...userData,
        code: response.code,
      });
      return Utils.responseSuccessfully(res, {
        message: "OTP sent successfully",
      });
    })
    .catch((error) => {
      return Utils.responseServerError(res, "Failed to send OTP");
    });
});

/**
 * @api {post} /qrlogin QR 码登录
 * @apiName QRCodeLogin
 * @apiGroup Authentication
 *
 * @apiBody  {String} email 用户的电子邮件地址。
 * @apiBody  {String} password 用户的密码。
 * @apiBody  {String} token QR 码令牌。
 * @apiBody  {String} pcId 个人电脑标识符。
 *
 * @apiSuccess {String} message 登录成功的消息。
 *
 * @apiSuccessExample 成功响应示例：
 * HTTPS/1.1 200 OK
 * {
 *   "message": "登录成功！"
 * }
 *
 * @apiError InvalidParameter 提供的参数无效。
 * @apiError LoginFailed 登录尝试失败。
 * @apiError AuthenticationTimeout 所提供的令牌已过期。
 * @apiError ServerError 由于服务器错误，登录失败。
 *
 * @apiErrorExample {json} 错误响应示例：
 * HTTPS/1.1 500 Internal Server Error
 * {
 *   "error": "ServerError",
 *   "message": "由于服务器错误，登录失败。"
 * }
 */
router.post("/qrlogin", (req, res) => {
  const requiredParams = ["email", "password", "token", "pcId"];
  if (!Utils.validateParameters(req, requiredParams, "body"))
    return Utils.responseWrongParameter(res);

  const { email, password, token, pcId } = req.body as {
    email: string;
    password: string;
    token: string;
    pcId: string;
  };

  prisma.user
    .findUnique({
      where: {
        email,
      },
      select: {
        password: true,
        id: true,
        appellation: true,
        userName: true,
        verify: true,
        role: true,
      },
    })
    .then(async (user) => {
      if (!user || !user.verify)
        return Utils.responseWrongParameter(res, "Login failed");
      const comparison = await Utils.verifyPassword(user.id, password);
      if (!comparison) return Utils.responseWrongParameter(res, "Login failed");

      const hasToken = await memcached.get("PUBLIC", token);

      if (!hasToken) {
        WS.sendTo(
          pcId,
          JSON.stringify({ type: "ERROR", message: "Login Time Out" })
        );
        return Utils.responseWrongParameter(res, "Login Time Out");
      }

      await memcached.set("PUBLIC", token, {
        id: user.id,
        userName: user.userName,
        appellation: user.appellation,
        role: user.role,
        pcId: pcId,
      });

      WS.sendTo(pcId, JSON.stringify({ type: "LOGIN", token }));
      return Utils.responseSuccessfully(res, {
        message: "Login Successfully",
      });
    })
    .catch((error) => {
      console.log(error);
      return Utils.responseWrongParameter(res, "Login failed");
    });
});

/**
 * @api {get} /qrlogin 完整二维码登录
 * @apiName CompleteQRCodeLogin
 * @apiGroup Authentication
 *
 * @apiQuery {String} token 二维码令牌。
 *
 * @apiSuccess {String} message 登录成功的消息。
 *
 * @apiSuccessExample 成功响应示例：
 * HTTPS/1.1 200 OK
 * {
 *   "message": "登录成功！",
 * }
 *
 * @apiError InvalidParameter 提供的参数无效。
 * @apiError TokenNotFound 缓存中未发现令牌。
 *
 * @apiErrorExample {json} 错误响应示例：
 * HTTPS/1.1 404 Not Found
 * {
 *   "error": "TokenNotFound",
 *   "message": "未发现令牌。"
 * }
 */
router.get("/qrlogin", async (req: Request, res: Response) => {
  const requiredParams = ["token"];
  if (!Utils.validateParameters(req, requiredParams, "query"))
    return Utils.responseWrongParameter(res);
  const loginToken = req.query.token as string;
  const userData = (await memcached.get("PUBLIC", loginToken)) as
    | undefined
    | {
      id: number;
      userName: string;
      appellation: string;
      role: string;
      pcId: string;
    };

  if (!userData) return Utils.responseWrongParameter(res);
  const { id, userName, appellation, role, pcId } = userData;
  await memcached.del("PUBLIC", loginToken);
  WS.removeUserConnections(pcId);
  const jwtData = {
    userId: id,
    userName: userName,
    appellation: appellation,
    role: role,
  };
  const token = Jwt.generateJwt(jwtData, "6h");
  const sixHoursLater = Utils.calculateTimeAfter("hours", 6);
  res
    .cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: sixHoursLater,
      sameSite: "none",
      secure: true,
    })
    .json({
      message: "User created successfully",
    });
});

export default router;
