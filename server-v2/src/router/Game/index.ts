// npm
import { Router, Request, Response, NextFunction } from "express";
import path from "path";
import PromiseRouter from "express-promise-router";
import { config } from "dotenv";
import { GameClassify } from "@prisma/client";
import fs from "fs";

// components
import Jwt from "../../components/Jwt";
import Utils from "../../components/Utils";
import prisma from "../../components/Prisma";
import { upload } from "../../components/Storage";

// type
import  * as GameType from "../../components/type/GameType";

config({ path: "../../.env" });

const router = PromiseRouter();
type GameRequest = Utils.UtilsType.RequirementType<
  Request,
  { userId: string; role: Utils.UtilsType.Role },
  {}
>;

router.use(async (req: GameRequest, res: Response, next: NextFunction) => {
  const token: string | undefined = req.cookies.token;
  if (!token) return Utils.responseWrongParameter(res, "not logged in");
  Jwt.verifyJwt(token as string)
    .then((results) => {
      req.userId = results.userId;
      req.role = results.role;
      next();
    })
    .catch((error) => {
      return Utils.responseWrongParameter(res);
    });
});

/**
 * @api {get} /gameclassify 获取游戏分组
 * @apiName GetGameClassify
 * @apiGroup 游戏
 * @apiPermission 需要登录的用户
 *
 * @apiSuccess {Object[]} classify 游戏分组列表。
 * @apiSuccess {String} classify.name 分组名称。
 * @apiSuccess {String} classify.description 分组详细说明。
 *
 * @apiSuccessExample 成功响应示例：
 * HTTP/1.1 200 OK
 * {
 *   "classify": [
 *     {
 *       "name": "pecs",
 *       "description": "胸肌（胸大肌）是位于胸部的大型肌肉，用于推动动作，如卧推。"
 *     },
 *     {
 *       "name": "abs",
 *       "description": "腹肌（腹直肌）是腹部的肌肉，用于支持核心和身体的稳定性。"
 *     },
 *     // 其他分组
 *   ]
 * }
 */
router.get("/gameclassify", async (req, res) => {
  const filePath = "./system/json/gameClassify.json";
  if (!fs.existsSync(filePath)) {
    return Utils.responseServerError(res, "File not found.");
  }
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      return Utils.responseServerError(
        res,
        "Unable to read game classification information."
      );
    }
    const gameClassify = JSON.parse(data);
    res.json(gameClassify);
  });
});

/**
 * @api {post} /creategame 創建遊戲
 * @apiName CreateGame
 * @apiGroup Game
 * @apiPermission admin
 *
 * @apiBody {String} gameName 遊戲名稱。
 * @apiBody {String} gameContent 遊戲內容。
 * @apiBody {Number} playTime 遊戲時長。
 * @apiBody {String[]="pecs"|"abs"|"obliques"|"hip_adductor"|"quads"|"deltoids"|"biceps"|"adductor"|"traps"|"lats"|"triceps"|"glutes"|"hambooleans"|"calves"|"aerobic"|"anaerobic"[]} classifys 遊戲分類。
 * @apiBody {File} image 遊戲圖片。
 *
 * @apiSuccess {String} message 成功信息。
 *
 * @apiSuccessExample 成功响应示例：
 * HTTPS/1.1 200 OK
 * {
 *   "message": "遊戲創建成功！"
 * }
 *
 * @apiError InvalidParameter 提供的參數無效。
 * @apiError NoAuthority 沒有足夠權限執行操作。
 * @apiError UploadFailed 上傳遊戲失敗。
 * @apiError ServerError 服務器錯誤。
 *
 * @apiErrorExample {json} 错误响应示例：
 * HTTPS/1.1 500 Internal Server Error
 * {
 *   "error": "ServerError",
 *   "message": "服務器錯誤。"
 * }
 */
router.post(
  "/creategame",
  upload.single("image"),
  async (req: GameRequest, res: Response) => {
    const requiredParams = ["gameName"];
    if (!Utils.validateParameters(req, requiredParams, "body"))
      return Utils.responseWrongParameter(res);
    if (!Utils.checkPermission(req.role!)) {
      console.log(req.role);
      fs.unlink(req.file!.path, (err) => {
        if (err) console.log(err);
        return Utils.responseWrongParameter(
          res,
          "You don't have enough authority."
        );
      });
      return;
    }
    const { gameName, gameContent, playTime, classifys } =
      req.body as GameType.CreateGame;
      
    const userId = req.userId!;
    
    const gameClassifys = classifys.reduce((obj, key) => {
      return { ...obj, [key]: true };
    }, {}) as GameClassify;

    prisma.game
      .create({
        data: {
          gameName: gameName,
          gameContent: gameContent,
          playTime: +playTime,
          imgId: path.basename(req.file?.path as string),
          author: {
            connect: {
              id: +userId,
            },
          },
          classify: {
            create: {
              ...gameClassifys,
            },
          },
        },
      })
      .then((results) => {
        return Utils.responseSuccessfully(res, {
          message: "uploaded successfully",
        });
      })
      .catch((error) => {
        return Utils.responseServerError(res, "Upload failed");
      });
  }
);

/**
 * @api {post} /favorite 收藏遊戲
 * @apiName FavoriteGame
 * @apiGroup Game
 * @apiPermission authenticated user
 *
 * @apiBody {Number} gameId 遊戲 ID。
 * @apiBody {Boolean} isFavorite 是否收藏。
 *
 * @apiSuccess {String} message 成功信息。
 * @apiSuccess {Number} gameFavorite 更新後的遊戲收藏數量。
 *
 * @apiSuccessExample 成功响应示例：
 * HTTPS/1.1 200 OK
 * {
 *   "message": "遊戲已成功收藏！",
 *   "gameFavorite": 55
 * }
 *
 * @apiError InvalidParameter 提供的參數無效。
 * @apiError NoAuthority 沒有足夠權限執行操作。
 * @apiError GameNotFound 遊戲不存在。
 *
 * @apiErrorExample {json} 错误响应示例：
 * HTTPS/1.1 404 Not Found
 * {
 *   "error": "GameNotFound",
 *   "message": "遊戲不存在。"
 * }
 *
 * @apiUse ServerError
 */
router.post("/favorite", async (req: GameRequest, res: Response) => {
  const requiredParams = ["gameId", "isFavorite"];
  if (!Utils.validateParameters(req, requiredParams, "body"))
    return Utils.responseWrongParameter(res);
  if (!Utils.checkPermission(req.role!))
    return Utils.responseWrongParameter(
      res,
      "You don't have enough authority."
    );
  const { gameId, isFavorite } = req.body as {
    gameId: number;
    isFavorite: boolean;
  };

  const userId = +req.userId!;

  try {
    const userCount = await prisma.user.count({
      where: {
        id: userId,
        gameFavorite: {
          some: {
            id: gameId,
          },
        },
      },
    });

    const updateQuantity = userCount > 0 ? (isFavorite ? 0 : -1) : 1;

    const updateGame = await prisma.game.update({
      where: {
        id: gameId,
      },
      data: {
        favoriteUserGame: {
          connect: {
            id: userId,
          },
        },
        gameFavorite: {
          increment: updateQuantity,
        },
      },
    });
    if (!updateGame) {
      Utils.responseWrongParameter(res, "update failed!");
      return;
    }
    if (isFavorite) {
      await prisma.user.update({
        where: {
          id: +userId,
        },
        data: {
          gameFavorite: {
            connect: {
              id: gameId,
            },
          },
        },
      });
    } else {
      await prisma.user.update({
        where: {
          id: +userId,
        },
        data: {
          gameFavorite: {
            disconnect: {
              id: gameId,
            },
          },
        },
      });
    }
    return Utils.responseSuccessfully(res, {
      message: "update completed",
      gameFavorite: updateGame.gameFavorite,
    });
  } catch {
    return Utils.responseServerError(res, "Update failed");
  }
});

/**
 * @api {get} /games 獲取遊戲列表
 * @apiName GetGames
 * @apiGroup Game
 * @apiPermission authenticated user
 *
 * @apiParam {String} [token] 分頁用的 token。
 * @apiQuery {Number{1-10}} [piece=7] 多少信息。
 *
 * @apiSuccess {Object[]} gamesData 遊戲列表數據。
 *
 * @apiSuccess {String} gamesData.gameName 遊戲名稱。
 * @apiSuccess {Object[]} gamesData.games 遊戲列表。
 * @apiSuccess {String[]} gamesData.games.classifys 遊戲分類列表。
 * @apiSuccess {Boolean} gamesData.games.isFavorite 是否已收藏。
 * @apiSuccess {String} gamesData.games.gameContent 遊戲內容。
 * @apiSuccess {Number} gamesData.games.playTime 遊戲時長。
 * @apiSuccess {String} gamesData.games.imgId 遊戲圖片 ID。
 * @apiSuccess {Number} gamesData.games.gameUsageCount 遊戲使用次數。
 * @apiSuccess {Number} gamesData.games.gameFavorite 遊戲收藏數量。
 * @apiSuccess {Number} gamesData.games.id 遊戲 ID。
 *
 * @apiSuccess {Boolean} gamesData.isEnd 是否到達列表結尾。
 * @apiSuccess {String} token 分頁用的 token。
 *
 * @apiSuccessExample 成功响应示例：
 * HTTPS/1.1 200 OK
 * {
 *   "gamesData": [
 *     "gameName": "遊戲列表",
 *     "games": [
 *       {
 *         "classifys": ["pecs", "abs"],
 *         "isFavorite": true,
 *         "gameContent": "遊戲內容...",
 *         "playTime": 15,
 *         "imgId": "img123",
 *         "gameUsageCount": 200,
 *         "gameFavorite": 50,
 *         "id": 1
 *       },
 *       // 更多遊戲...
 *     ],
 *     "isEnd": false
 *   },
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
 * ]
 *
 * @apiUse ServerError
 */
router.get("/games", async (req: GameRequest, res: Response) => {
  const token = req.query.token;
  const userId = req.userId!;

  const rawPiece = Number(req.query.piece);
  const piece = isNaN(rawPiece) || rawPiece < 1 || rawPiece > 10 ? 6 : rawPiece;

  let start = 0;
  try {
    if (token) {
      const data = await Jwt.verifyJwt(token as string);
      start = data.start;
    }
  } catch {}

  prisma.game
    .findMany({
      select: {
        gameName: true,
        gameContent: true,
        playTime: true,
        imgId: true,
        classify: true,
        gameUsageCount: true,
        gameFavorite: true,
        id: true,
        favoriteUserGame: {
          select: {
            id: true,
          },
        },
      },
      skip: start,
      take: piece,
    })
    .then((games) => {
      const token = Jwt.generateJwt(
        {
          start: start + piece,
        },
        "6h"
      );
      return Utils.responseSuccessfully(res, {
        gamesData: games.map(({ classify, favoriteUserGame, ...other }) => {
          return {
            classifys: Object.entries(classify).reduce(
              (filteredClassify, [key, value]) => {
                if (value === true)
                  filteredClassify.push(key as GameType.GameClassifyFieldKeys);
                return filteredClassify;
              },
              [] as GameType.GameClassifyFieldKeys[]
            ),
            isFavorite: favoriteUserGame.some((user) => user.id === +userId),
            ...other,
          };
        }),
        token,
        isEnd: games ? games.length < piece : false,
      });
    })
    .catch((error) => {
      return Utils.responseServerError(res, "Fetch failed");
    });
});

export default router;
