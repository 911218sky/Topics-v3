// npm
import { Router, Request, Response, NextFunction } from "express";
import { config } from "dotenv";
import PromiseRouter from "express-promise-router";

// components
import Jwt from "../../components/Jwt";
import Utils from "../../components/Utils";
import prisma, { Prisma } from "../../components/Prisma";
import SendMessage from "../../components/SendMessage";

// type
import type * as MenuType from "../../components/type/MenuType";
import type { GameClassifyFieldKeys } from "../../components/type/GameType";

config({ path: "../../.env" });

const router = PromiseRouter();
type MenuRequest = Utils.UtilsType.RequirementType<
  Request,
  { userId: string; role: Utils.UtilsType.Role; userName: string },
  {}
>;

router.use(async (req: MenuRequest, res: Response, next: NextFunction) => {
  const token: string | undefined = req.cookies.token;
  if (!token) return Utils.responseWrongParameter(res, "not logged in");
  Jwt.verifyJwt(token as string)
    .then((results) => {
      req.userId = results.userId;
      req.userName = results.userName;
      req.role = results.role;
      next();
    })
    .catch((error) => {
      return Utils.responseWrongParameter(res);
    });
});

/**
 * @api {post} /create 创建菜单
 * @apiName CreateMenu
 * @apiGroup Menu
 * @apiPermission admin
 * @apiPermission doctor
 *
 * @apiBody {Number[]} games 与菜单相关的游戏 ID 列表。
 * @apiBody {String} menuName 菜单名称。
 * @apiBody {String} menuContent 菜单内容/描述。
 * @apiBody {String[]="Hard"|"Medium"|"Simple"} gameDifficulty 游戏难度级别。
 * @apiBody {Boolean} isPublic 决定菜单是公开还是私有。
 * @apiBody {number} totalTime 多少游戏时间(秒)。
 *
 * @apiSuccess {String} message 成功信息。
 * @apiSuccess {Number} id 已创建菜单的 ID。
 *
 * @apiSuccessExample 成功响应示例：
 * HTTPS/1.1 200 OK
 * {
 *   "message": "菜单创建成功！",
 *   "id": 123
 * }
 *
 * @apiError WrongParameter 无效或缺少参数。
 *
 * @apiErrorExample {json} 错误响应示例：
 * HTTPS/1.1 400 Bad Request
 * {
 *   "error": "WrongParameter",
 *   "message": "无效或缺少参数。"
 * }
 *
 * @apiError Unauthorized 没有足够权限创建菜单。
 *
 * @apiErrorExample {json} 错误响应示例：
 * HTTPS/1.1 401 Unauthorized
 * {
 *   "error": "Unauthorized",
 *   "message": "没有足够权限创建菜单。"
 * }
 *
 * @apiError (请求失败 (500)) ServerError 创建菜单失败。
 *
 * @apiErrorExample {json} 错误响应示例：
 * HTTPS/1.1 500 Internal Server Error
 * {
 *   "error": "ServerError",
 *   "message": "创建菜单失败。"
 * }
 */
router.post("/create", async (req: MenuRequest, res: Response) => {
  const requiredParams = [
    "game",
    "menuName",
    "menuContent",
    "gameDifficulty",
    "isPublic",
    "totalTime",
  ];
  if (!Utils.validateParameters(req, requiredParams, "body"))
    return Utils.responseWrongParameter(res);
  if (!Utils.checkPermission(req.role!))
    return Utils.responseWrongParameter(
      res,
      "You don't have enough authority."
    );

  const { game, menuName, menuContent, gameDifficulty, isPublic, totalTime } =
    req.body as MenuType.CreatMenu;

  if (game.length === 0) {
    Utils.responseWrongParameter(res, "Cannot be an empty task!");
    return;
  }

  if (game.length !== gameDifficulty.length) {
    Utils.responseWrongParameter(res, "Task parameter error!");
    return;
  }

  const userId = req.userId as string;
  prisma.menu
    .create({
      data: {
        menuName: menuName,
        menuContent: menuContent,
        author: {
          connect: {
            id: +userId,
          },
        },
        game: {
          connect: game.map((gameId) => ({ id: gameId })),
        },
        gameOrderId: game,
        gameDifficulty: JSON.stringify(gameDifficulty),
        isPublic: isPublic,
        totalTime: totalTime,
      },
    })
    .then((results) => {
      return Utils.responseSuccessfully(res, {
        message: "Menu created successfully",
        id: results.id,
      });
    })
    .catch((error) => {
      console.log(error);
      return Utils.responseWrongParameter(res, "Upload failed");
    });
});

/**
 * @api {post} /distribute 分发分发菜单
 * @apiName DistributeMenu
 * @apiGroup Menu
 * @apiPermission doctor
 * @apiPermission admin
 *
 * @apiBody {Number[]} usersId 将被分发菜单的用户 ID 列表。
 * @apiBody {Number} menuId 要分发的菜单的 ID。
 * @apiBody {Date} startTime 发送开始时间。
 * @apiBody {Date} endTime 发送结束时间。
 *
 * @apiSuccess {String} message 成功消息。
 *
 * @apiSuccessExample 成功响应示例：
 * HTTPS/1.1 200 OK
 * {
 *   "message": "菜单分发成功！"
 * }
 *
 * @apiError WrongParameter 无效或缺少参数。
 *
 * @apiErrorExample {json} 错误响应示例：
 * HTTPS/1.1 400 Bad Request
 * {
 *   "error": "WrongParameter",
 *   "message": "无效或缺少参数。"
 * }
 *
 * @apiError (请求失败 (500)) ServerError 发送菜单失败。
 *
 * @apiErrorExample {json} 错误响应示例：
 * HTTPS/1.1 500 Internal Server Error
 * {
 *   "error": "ServerError",
 *   "message": "发送菜单失败。"
 * }
 */
router.post("/distribute", async (req: MenuRequest, res: Response) => {
  const requiredParams = ["usersId", "menuId", "startTime", "endTime"];
  if (!Utils.validateParameters(req, requiredParams, "body"))
    return Utils.responseWrongParameter(res);

  const { usersId, menuId, startTime, endTime } =
    req.body as MenuType.Distribute;

  prisma.userAssignment
    .create({
      data: {
        menu: {
          connect: {
            id: menuId,
          },
        },
        startDate: startTime,
        endDate: endTime,
        author: {
          connect: {
            id: +req.userId!,
          },
        },
        user: {
          connect: usersId.map((userId) => ({ id: userId })),
        },
      },
    })
    .then((userAssignment) => {
      return prisma.menu.update({
        where: {
          id: userAssignment.menuId,
        },
        data: {
          menuUsageCount: {
            increment: 1,
          },
        },
      });
    })
    .then((updateMenu) => {
      return SendMessage.sendToUsers(
        {
          title: "Task sending notification",
          body: `${req.userName} doctor a task has been assigned to you`,
        },
        usersId
      );
    })
    .then(() => {
      Utils.responseSuccessfully(res, {
        message: "Distribute created successfully",
      });
    })
    .catch((error) => {
      console.log(error);
      return Utils.responseWrongParameter(res, "Upload failed");
    });
});

/**
 * @api {get} /menu 获取菜单列表
 * @apiName GetMenuList
 * @apiGroup Menu
 * @apiPermission authenticatedUser
 *
 * @apiQuery {String} [token] 用于分页的可选 JWT 令牌
 *
 * @apiSuccess {String} message 成功消息。
 *
 * @apiSuccess {Object[]} menus 菜单列表。
 * @apiSuccess {String} menus.menuName 菜单名称。
 * @apiSuccess {String} menus.menuContent 菜单内容。
 *
 * @apiSuccess {Object[]} menus.game 菜单中包含的游戏列表。
 * @apiSuccess {String} menus.game.gameName 游戏名称。
 * @apiSuccess {String} menus.game.imgId 游戏图像的 ID。
 * @apiSuccess {Number} menus.game.id 游戏的 ID。
 * @apiSuccess {Number[]} menus.gameOrderId 菜单中游戏的顺序。
 * @apiSuccess {String} menus.gameDifficulty JSON 格式的游戏难度级别。
 *
 * @apiSuccess {Object} menus.author 菜单作者。
 * @apiSuccess {String} menus.author.userName 菜单作者的名称。
 * @apiSuccess {String|null} menus.author.imgId 作者的图片 ID。
 *
 * @apiSuccess {String} menus.menuCreateTime 菜单创建时间。
 * @apiSuccess {Number} menus.totalTime 菜单的总时间。
 * @apiSuccess {Number} menus.menuUsageCount 菜单的使用次数。
 * @apiSuccess {Boolean} menus.menuFavorite 表示菜单是否为收藏夹。
 * @apiSuccess {Number} menus.id 菜单的 ID。
 * @apiSuccess {String} token 用于分页的 JWT 标记。
 * @apiSuccess {Boolean} isEnd 指示是否已到达列表末尾。
 *
 * @apiSuccessExample 成功响应示例：
 * HTTPS/1.1 200 OK
 * {
 *   "message": "获取成功！",
 *   "menus": [
 *     {
 *       "menuName": "早餐菜单",
 *       "menuContent": "精选早餐食谱...",
 *       "game": [
 *         {
 *           "gameName": "游戏1",
 *           "imgId": "img123",
 *           "id": 1,
 *           "gameOrderId": [1, 2],
 *           "gameDifficulty": "{\"easy\": true, \"medium\": false, \"hard\": true}"
 *         },
 *         // 更多游戏...
 *       ],
 *       "author": {
 *         "userName": "author1",
 *         "imgId": "img456"
 *       },
 *       "menuCreateTime": "2023-08-01T12:00:00.000Z",
 *       "totalTime": 30,
 *       "menuUsageCount": 100,
 *       "menuFavorite": true,
 *       "id": 123
 *     },
 *     // 更多菜单...
 *   ],
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
 *   "isEnd": false
 * }
 *
 * @apiUse ServerError
 */
router.get("/menu", async (req: MenuRequest, res: Response) => {
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

  prisma.menu
    .findMany({
      where: {
        OR: [{ isPublic: true }, { author: { id: +userId } }],
      },
      select: {
        author: {
          select: {
            userName: true,
            imgId: true,
          },
        },
        game: {
          select: {
            gameName: true,
            imgId: true,
            id: true,
          },
        },
        menuName: true,
        menuContent: true,
        gameOrderId: true,
        gameDifficulty: true,
        menuCreateTime: true,
        totalTime: true,
        menuUsageCount: true,
        menuFavorite: true,
        id: true,
      },
      skip: start,
      take: once,
      orderBy: {
        menuCreateTime: "desc",
      },
    })
    .then(async (menu) => {
      const token = Jwt.generateJwt(
        {
          start: start + once,
        },
        "6h"
      );

      const gameData = await prisma.game.findMany({
        select: {
          gameName: true,
          imgId: true,
          id: true,
        },
      });

      const gameDataById: { [key: number]: (typeof gameData)[0] } = {};
      for (const game of gameData) {
        gameDataById[game.id] = game;
      }

      return Utils.responseSuccessfully(res, {
        message: "search successful",
        menus: menu.map(({ gameOrderId, game, ...other }) => {
          const gameId: number[] = gameOrderId as number[];
          return {
            ...other,
            game: gameId.map((id) => {
              return gameDataById[id];
            }),
            gameOrderId,
          };
        }),
        token,
        isEnd: menu ? menu.length < once : false,
      });
    })
    .catch((error) => {
      Utils.responseServerError(res, "Failed to get");
    });
});

/**
 * @api {get} /menu/:menuId 获取菜单信息
 * @apiName GetMenuInfo
 * @apiGroup Menu
 * @apiDescription 获取特定菜单的详细信息。
 *
 * @apiParam {Number} menuId 菜单的唯一标识符。
 * @apiPermission doctor
 * @apiPermission admin
 *
 * @apiSuccess {String} message 获取成功的消息。
 * @apiSuccess {Object} menu 菜单信息对象。
 * @apiSuccess {String} menu.id 菜单ID。
 * @apiSuccess {String} menu.menuName 菜单名称。
 * @apiSuccess {String} menu.menuContent 菜单内容。
 * @apiSuccess {Number[]} menu.gameOrderId 游戏顺序的标识符数组。
 * @apiSuccess {Number} menu.totalTime 菜单总时间。
 * @apiSuccess {String[]} menu.gameDifficulty 游戏难度。可能的值: "Hard", "Medium", "Simple"。
 * @apiSuccess {Object[]} menu.game 关联游戏信息对象数组。
 * @apiSuccess {String} menu.game.gameName 游戏名称。
 * @apiSuccess {String} menu.game.imgId 游戏图像标识符。
 * @apiSuccess {Number} menu.game.playTime 游戏的播放时间 (秒)。
 * @apiSuccess {Number} menu.game.id 游戏的唯一标识符。
 *
 * @apiSuccessExample {json} 成功响应示例:
 * {
 *    "message": "获取成功",
 *    "menu": {
 *        "id" : 1,
 *        "menuName": "菜单名称",
 *        "menuContent": "菜单内容",
 *        "gameOrderId": [1, 2, 3],
 *        "totalTime": 60,
 *        "gameDifficulty": ["Hard","Medium"],
 *
 *        "game": [
 *            {
 *                "gameName": "游戏1",
 *                "imgId": "game1.jpg",
 *                "playTime": 20,
 *                "id": 1
 *            },
 *            {
 *                "gameName": "游戏2",
 *                "imgId": "game2.jpg",
 *                "playTime": 25,
 *                "id": 2
 *            }
 *        ]
 *    }
 * }
 *
 * @apiError InvalidParameter 提供的参数无效。
 * @apiError DataNotFound 未找到与提供的 menuId 相关的数据。
 * @apiUse ServerError
 */
router.get("/menu/:menuId", async (req: MenuRequest, res: Response) => {
  const { menuId } = req.params;

  if (isNaN(+menuId)) {
    Utils.responseWrongParameter(res);
    return;
  }

  prisma.menu
    .findUnique({
      where: {
        id: +menuId,
      },
      select: {
        id: true,
        menuName: true,
        menuContent: true,
        gameOrderId: true,
        totalTime: true,
        gameDifficulty: true,
        game: {
          select: {
            gameName: true,
            imgId: true,
            playTime: true,
            id: true,
          },
        },
      },
    })
    .then(async (menu) => {
      if (!menu) {
        Utils.responseWrongParameter(res, "Didn't find anything");
        return;
      }
      const gamesById = menu.game.reduce((accumulator, currentGame) => {
        accumulator[currentGame.id] = currentGame;
        return accumulator;
      }, {} as { [key: number]: (typeof menu.game)[0] });

      menu.gameDifficulty = JSON.parse(
        menu.gameDifficulty as string
      ) as string[];

      menu.game = (menu.gameOrderId as number[]).map((id) => gamesById[id]);

      Utils.responseSuccessfully(res, {
        message: "Get success",
        menu,
      });
    })
    .catch((error) => {
      console.log(error);
      Utils.responseServerError(res, "Failed to get");
    });
});

/**
 * @api {post} /favorite 收藏菜单
 * @apiName FavoriteMenu
 * @apiGroup Menu
 * @apiPermission authenticated user
 *
 * @apiBody {Number} menuId 菜单 ID。
 * @apiBody {Boolean} isFavorite 是否收藏。
 *
 * @apiSuccess {String} message 成功信息。
 * @apiSuccess {Number} menuFavorite 更新后的菜单收藏数量。
 *
 * @apiSuccessExample 成功响应示例：
 * HTTPS/1.1 200 OK
 * {
 *   "message": "菜单已成功收藏！",
 *   "menuFavorite": 40
 * }
 *
 * @apiError InvalidParameter 提供的参数无效。
 * @apiError NoAuthority 没有足够权限执行操作。
 * @apiError MenuNotFound 菜单不存在。
 *
 * @apiErrorExample {json} 错误响应示例：
 * HTTPS/1.1 404 Not Found
 * {
 *   "error": "MenuNotFound",
 *   "message": "菜单不存在。"
 * }
 *
 * @apiUse ServerError
 */
router.post("/favorite", async (req: MenuRequest, res: Response) => {
  const requiredParams = ["menuId", "isFavorite"];
  if (!Utils.validateParameters(req, requiredParams, "body"))
    return Utils.responseWrongParameter(res);
  if (!Utils.checkPermission(req.role!))
    return Utils.responseWrongParameter(
      res,
      "You don't have enough authority."
    );
  const { menuId, isFavorite } = req.body as {
    menuId: number;
    isFavorite: boolean;
  };

  const userId = +req.userId!;

  try {
    const userCount = await prisma.user.count({
      where: {
        id: userId,
        menuFavorite: {
          some: {
            id: menuId,
          },
        },
      },
    });
    const updateQuantity = userCount > 0 ? (isFavorite ? 0 : -1) : 1;
    const updateMenu = await prisma.menu.update({
      where: {
        id: menuId,
      },
      data: {
        favoriteUser: {
          connect: {
            id: userId,
          },
        },
        menuFavorite: {
          increment: updateQuantity,
        },
      },
    });

    if (!updateMenu) {
      Utils.responseWrongParameter(res, "update failed!");
      return;
    }

    if (isFavorite) {
      await prisma.user.update({
        where: {
          id: +userId,
        },
        data: {
          menuFavorite: {
            connect: {
              id: menuId,
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
          menuFavorite: {
            disconnect: {
              id: menuId,
            },
          },
        },
      });
    }
    return Utils.responseSuccessfully(res, {
      message: "update completed",
      menuFavorite: updateMenu.menuFavorite,
    });
  } catch {
    return Utils.responseServerError(res, "Update failed");
  }
});

/**
 * @api {get} /mymenu 获取我的菜单
 * @apiName 获取我的菜单
 * @apiGroup Menu
 *
 * @apiQuery {Boolean} [onlyIsDoneData] 是否返回完成的資料。
 * @apiQuery {Boolean} [dateExpired=true] 是否返回日期過期資料。需要带入参数onlyIsDoneData=true才有用。
 *
 * @apiQuery {Boolean} [isTable] 是否返回为Table样式。
 * @apiQuery {Number} [startPage=1] 开始页码。需要带入参数isTable=true才有用。
 * @apiQuery {Number{1-10}} [piece=7] 多少信息。需要带入参数isTable=true才有用。
 *
 * @apiQuery {String} [token] 用于分页的可选 JWT 令牌。带入参数isTable=true則會失效。
 *
 * @apiPermission authenticatedUser
 * @apiSuccess {String} message 操作成功的消息
 * @apiSuccess {Object[]} assignment 菜单分配列表
 * @apiSuccess {Boolean} assignment.isDone 菜单分配是否已完成
 * @apiSuccess {Number} assignment.id 菜单分配ID
 * @apiSuccess {Object} assignment.menu 菜单信息
 * @apiSuccess {Object} assignment.author 作者信息
 * @apiSuccess {Number} assignment.author.id 作者ID
 * @apiSuccess {String} assignment.author.userName 作者用户名
 * @apiSuccess {String} assignment.author.imgId 作者头像ID (可能为null)
 * @apiSuccess {String} assignment.menu.menuName 菜单名称
 * @apiSuccess {String} assignment.menu.menuContent 菜单内容
 * @apiSuccess {String} assignment.startDate 菜单分配开始日期
 * @apiSuccess {String} assignment.endDate 菜单分配结束日期
 * @apiSuccess {String} token 用于分页的 JWT 标记。
 * @apiSuccess {Boolean} isEnd 指示是否已到达列表末尾。
 *
 * @apiSuccessExample {json} 成功响应示例:
 * HTTP/1.1 200 OK
 * {
 *   "message": "操作成功",
 *   "assignment": [
 *     {
 *       "isDone": true,
 *       "id": 1,
 *       "menu": {
 *         "author": {
 *           "id": 123,
 *           "userName": "JohnDoe",
 *           "imgId": "user123.jpg"
 *         },
 *         "menuName": "特别菜单",
 *         "menuContent": "美味的食物项目"
 *       },
 *       "startDate": "2023-09-12T00:00:00Z",
 *       "endDate": "2023-09-20T00:00:00Z"
 *     },
 *     {
 *       "isDone": false,
 *       "id": 2,
 *       "menu": {
 *         "author": null,
 *         "menuName": "常规菜单",
 *         "menuContent": "每天的选择"
 *       },
 *       "startDate": "2023-09-15T00:00:00Z",
 *       "endDate": "2023-09-25T00:00:00Z"
 *     }
 *   ]
 * }
 *
 * @apiError {String} message 错误消息。
 * @apiUse ServerError
 */
router.get("/mymenu", async (req: MenuRequest, res: Response) => {
  if (req.query.isTable === "true") return getMyMenuTable(req, res);
  else if (req.query.onlyIsDoneData === "true")
    return getOnlyIsDoneData(req, res);
  const userId = +req.userId!;
  const token = req.query.token;
  const once = 7;
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
        id: userId,
      },
      select: {
        isDoneMenu: true,
        userAssignment: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            author: {
              select: {
                id: true,
                userName: true,
                imgId: true,
              },
            },
            menu: {
              select: {
                menuName: true,
                menuContent: true,
              },
            },
          },
          skip: start,
          take: once,
        },
      },
    })
    .then((myMenu) => {
      const token = Jwt.generateJwt(
        {
          start: start + once,
        },
        "6h"
      );
      const isDoneMenu = myMenu?.isDoneMenu
        ? (JSON.parse(myMenu.isDoneMenu as string) as number[])
        : [];
      Utils.responseSuccessfully(res, {
        message: "Get success!",
        assignment: myMenu?.userAssignment.map((assignment) => ({
          ...assignment,
          isDone: isDoneMenu.includes(assignment.id),
        })),
        token,
        isEnd: myMenu?.userAssignment
          ? myMenu.userAssignment.length < once
          : false,
      });
    })
    .catch((error) => {
      Utils.responseServerError(res, "Get failed");
    });
});

async function getMyMenuTable(req: MenuRequest, res: Response) {
  const startPage = Math.max(
    1,
    !isNaN(Number(req.query.startPage)) ? Number(req.query.startPage) : 1
  );
  const rawPiece = Number(req.query.piece);
  const piece = isNaN(rawPiece) || rawPiece < 1 || rawPiece > 10 ? 7 : rawPiece;
  const userId = +req.userId!;

  const totalPages = Math.ceil(
    (
      await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          authorAssignment: {
            select: {
              id: true,
            },
          },
        },
      })
    )?.authorAssignment.length || 1 / piece
  );

  const assignment = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      isDoneMenu: true,
      userAssignment: {
        select: {
          id: true,
          startDate: true,
          endDate: true,
          author: {
            select: {
              id: true,
              userName: true,
              imgId: true,
            },
          },
          menu: {
            select: {
              menuName: true,
              menuContent: true,
            },
          },
        },
        skip: piece * (startPage - 1),
        take: piece,
      },
    },
  });

  const isDoneMenu = assignment?.isDoneMenu
    ? (JSON.parse(assignment.isDoneMenu as string) as number[])
    : [];

  return Utils.responseSuccessfully(res, {
    message: "Get success",
    assignment: assignment?.userAssignment.map((assignment) => ({
      ...assignment,
      isDone: isDoneMenu.includes(assignment.id),
    })),
    totalPages,
  });
}

async function getOnlyIsDoneData(req: MenuRequest, res: Response) {
  const dateExpired = req.query.dateExpired
    ? req.query.dateExpired === "true"
      ? true
      : false
    : true;
  const rawPiece = Number(req.query.piece);
  const piece = isNaN(rawPiece) || rawPiece < 1 || rawPiece > 10 ? 7 : rawPiece;
  const userId = +req.userId!;
  const isDoneMenuIdObj = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      isDoneMenu: true,
    },
  });

  const isDoneMenu = (
    isDoneMenuIdObj?.isDoneMenu
      ? JSON.parse(isDoneMenuIdObj.isDoneMenu as string)
      : []
  ) as number[];

  const conditions: Prisma.UserAssignmentWhereInput = {
    NOT: {
      OR: [
        {
          id: {
            in: isDoneMenu,
          },
        },
      ],
    },
  };

  if (dateExpired) {
    const NOT = conditions.NOT as Prisma.UserAssignmentWhereInput;
    NOT.OR!.push({
      endDate: {
        gte: new Date("2020-03-19T14:21:00+0200"),
      },
    });
  }

  const assignment = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      isDoneMenu: true,
      userAssignment: {
        where: {
          ...conditions,
        },
        select: {
          id: true,
          startDate: true,
          endDate: true,
          author: {
            select: {
              id: true,
              userName: true,
              imgId: true,
            },
          },
          menu: {
            select: {
              menuName: true,
              menuContent: true,
            },
          },
        },
        take: piece,
      },
    },
  });

  return Utils.responseSuccessfully(res, {
    message: "Get success",
    assignment: assignment?.userAssignment.map((assignment) => ({
      ...assignment,
      isDone: false,
    })),
  });
}

/**
 * @api {GET} /mymenudetail/:menuId 獲取我的菜單詳細信息
 * @apiName GetMyMenuDetail
 * @apiGroup Menu
 * @apiPermission authenticated user
 *
 * @apiParam {Number} menuId 要获取详细信息的任务分配ID。
 *
 * @apiSuccess {String} message 成功消息。
 * @apiSuccess {Object} assignment 任务分配详细信息。
 * @apiSuccess {Number} assignment.id 任务分配ID。
 * @apiSuccess {Date} assignment.startDate 任务分配的开始日期。
 * @apiSuccess {Date} assignment.endDate 任务分配的结束日期。
 * @apiSuccess {Object} assignment.author 作者详细信息。
 * @apiSuccess {String} assignment.author.userName 作者的用户名。
 * @apiSuccess {Number} assignment.author.id 作者的ID。
 * @apiSuccess {String|null} assignment.author.imgId 作者的图像ID（可为空）。
 * @apiSuccess {Object} assignment.menu 任务分配的菜单详细信息。
 * @apiSuccess {String[]="Hard"|"Medium"|"Simple"[]} assignment.menu.gameDifficulty 游戏难度级别。
 * @apiSuccess {String} assignment.menu.menuName 菜單名稱。
 * @apiSuccess {Object[]} assignment.menu.game 游戏列表。
 * @apiSuccess {Number} assignment.menu.game[].id 游戏ID。
 * @apiSuccess {String} assignment.menu.game[].gameName 游戏名称。
 * @apiSuccess {String|null} assignment.menu.game[].imgId 游戏图像ID（可为空）。
 *
 * @apiSuccessExample 成功响应示例:
 *     HTTP/1.1 200 OK
 *     {
 *         "message": "获取成功",
 *         "assignment": {
 *             "id": 123,
 *             "startDate": "2023-10-02",
 *             "endDate": "2023-10-10",
 *             "author": {
 *                 "userName": "用户123",
 *                 "id": 456,
 *                 "imgId": "图片ID123" // 图像ID为字符串
 *             },
 *             "menu": {
 *                 "gameDifficulty" : ["Simple","Hard"]
 *                 "game": [
 *                     {
 *                         "id": 789,
 *                         "gameName": "游戏1",
 *                         "imgId": "游戏图像ID1" // 游戏图像ID为字符串
 *                     },
 *                     {
 *                         "id": 790,
 *                         "gameName": "游戏2",
 *                         "imgId": null // 游戏图像ID为空
 *                     }
 *                     // 可能还有更多游戏项目
 *                 ]
 *             }
 *         }
 *     }
 *
 * @apiError {String} message 错误消息。
 * @apiUse ServerError
 */
router.get("/mymenudetail/:menuId", async (req: MenuRequest, res: Response) => {
  const menuId = req.params.menuId;
  if (isNaN(Number(menuId))) {
    Utils.responseWrongParameter(res);
    return;
  }
  try {
    const assignment = await prisma.userAssignment.findUnique({
      where: {
        id: +menuId,
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        author: {
          select: {
            id: true,
            userName: true,
            imgId: true,
          },
        },
        menu: {
          select: {
            menuName: true,
            menuContent: true,
            gameDifficulty: true,
            game: {
              select: {
                id: true,
                gameName: true,
                imgId: true,
                gameContent: true,
                playTime: true,
                classify: true,
              },
            },
          },
        },
      },
    });
    if (!assignment) return Utils.responseWrongParameter(res, "Not Found");
    assignment.menu.gameDifficulty = JSON.parse(
      assignment.menu.gameDifficulty as string
    );

    assignment.menu.game.map(({ classify }, i) => {
      const trueKeys: GameClassifyFieldKeys[] = [];
      for (const key in classify) {
        if (key !== "id" && classify[key as GameClassifyFieldKeys] === true) {
          trueKeys.push(key as GameClassifyFieldKeys);
        }
      }
      classify = trueKeys as any;
    });

    return Utils.responseSuccessfully(res, {
      message: "Get success",
      assignment: {
        ...assignment,
        menu: {
          ...assignment.menu,
          game: assignment.menu.game.map(({ classify, ...remain }) => {
            const trueKeys = Object.keys(classify)
              .filter(
                (key) => key !== "id" && classify[key as GameClassifyFieldKeys]
              )
              .map((key) => key as GameClassifyFieldKeys);
            return {
              ...remain,
              classify: trueKeys,
            };
          }),
        },
      },
    });
  } catch (error) {
    return Utils.responseServerError(res, "Internal Server Error");
  }
});

export default router;
