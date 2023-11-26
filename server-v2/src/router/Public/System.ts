// npm
import { Router, Request, Response, NextFunction } from "express";
import PromiseRouter from "express-promise-router";
import fs, { promises as fsPromises } from "fs";
import sharp from "sharp";

// components
import Utils from "../../components/Utils";
import path from "path";

const router = PromiseRouter();

router.use(async (req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Cache-Control", "public, max-age=86400");
  next();
});

/**
 * @apiDefine NotFound
 *
 * @apiError (404) {String} message 错误对象表示未找到文件。
 *
 * @apiErrorExample {json} 错误响应示例：
 * HTTPS/1.1 404 Not Found
 * {
 *   "message": "未找到文件。"
 * }
 */

/**
 * @api {get} /image/:id 获取图像文件
 * @apiName GetImageFile
 * @apiGroup Public_System
 *
 * @apiParam {String} id 图像文件的唯一标识符。
 * @apiQuery {Boolean} [original] 表示是否获取图像文件的标志。
 * @apiQuery {Number} [width] 调整图片大小所需的宽度。
 * @apiQuery {String} [folder] 图像目录中的可选文件夹。
 *
 * @apiSuccess {Stream} image 图像流。
 *
 * @apiSuccessExample 成功响应示例：
 * HTTPS/1.1 200 OK
 * [图像流数据]
 *
 * @apiUse NotFound
 */
router.get("/image/:id", async (req: Request, res: Response) => {
  const requiredParams = ["id"];
  if (!Utils.validateParameters(req, requiredParams, "params"))
    return Utils.responseWrongParameter(res);

  const { original, width, folder } = req.query as {
    original: boolean | undefined;
    width: number | undefined;
    folder: string | undefined;
  };

  const { id } = req.params;
  const folderPath = folder ? `${folder}/` : "";
  const imagePath = `./system/image/${folderPath}${id}`;

  fsPromises
    .access(imagePath)
    .then(() => {
      let resizeOptions: object = { width: width ? width : 512 };
      if (original) resizeOptions = {};
      sharp(imagePath)
        .resize(resizeOptions)
        .toBuffer()
        .then((data) => {
          res.setHeader("Content-Type", "image/jpeg");
          res.setHeader("Content-Length", data.length);
          res.send(data);
          return;
        })
        .catch((error) => {
          return Utils.responseServerError(res, "Internal Server Error");
        });
    })
    .catch(() => {
      res.status(404).send({ message: "File not found." });
    });
});

/**
 * @api {get} /audio/:id 获取音频文件
 * @apiName GetAudioFile
 * @apiGroup Public_System
 *
 * @apiParam {String} id 音频文件的唯一标识符。
 *
 * @apiSuccess {Stream} audio 音频流。
 *
 * @apiSuccessExample 成功响应示例：
 * HTTPS/1.1 200 OK
 * [音频流数据]
 *
 * @apiUse NotFound
 */
router.get("/audio/:id", async (req, res) => {
  const requiredParams = ["id"];
  if (!Utils.validateParameters(req, requiredParams, "params"))
    return Utils.responseWrongParameter(res);
  const { id } = req.params;
  const audioPath = `./system/audio/${id}`;
  fsPromises
    .access(audioPath)
    .then(() => {
      res.set("Content-Type", "audio/mpeg");
      const fileStream = fs.createReadStream(audioPath);
      fileStream.pipe(res);
    })
    .catch(() => {
      res.status(404).send({ message: "File not found." });
    });
});

/**
 * @api {get} /video/:id 获取视频文件
 * @apiName GetVideoFile
 * @apiGroup Public_System
 *
 * @apiParam {String} id 视频文件的唯一标识符。
 *
 * @apiSuccess {Stream} video 视频流。
 *
 * @apiSuccessExample 成功响应示例：
 * HTTPS/1.1 200 OK
 * [视频流数据]
 *
 * @apiUse NotFound
 */
router.get("/video/:id", async (req, res) => {
  const requiredParams = ["id"];
  if (!Utils.validateParameters(req, requiredParams, "params"))
    return Utils.responseWrongParameter(res);
  const { id } = req.params;
  const videoPath = `./system/video/${id}`;
  fsPromises
    .access(videoPath)
    .then(() => {
      res.set("Content-Type", "video/mp4");
      const fileStream = fs.createReadStream(videoPath);
      fileStream.pipe(res);
    })
    .catch(() => {
      res.status(404).send({ message: "File not found." });
    });
});

/**
 * @api {get} /download/:id 下载文件
 * @apiName DownloadFile
 * @apiGroup Public_System
 *
 * @apiParam {String} id 文件的唯一标识符。
 * @apiQuery {String} [folder] 文件所在的文件夹。
 * 
 * @apiSuccess {File} file 下载的文件。
 * 
 * @apiSuccessExample 成功响应示例：
 * HTTPS/1.1 200 OK
 * 文件被成功下载。
 *
 * @apiUse NotFound
 */
router.get("/download/:id", async (req, res) => {
  const requiredParams = ["id"];
  if (!Utils.validateParameters(req, requiredParams, "params"))
    return Utils.responseWrongParameter(res);
  const { folder } = req.query as {
    folder: string | undefined;
  };
  const { id } = req.params;
  const folderPath = folder ? `${folder}/` : "";
  const filePath = `./system/${folderPath}${id}`;
  console.log(filePath);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found");
  }
  const fileName = path.basename(filePath);
  res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
  fileStream.on("end", () => {
    res.end();
  });
});

export default router;
