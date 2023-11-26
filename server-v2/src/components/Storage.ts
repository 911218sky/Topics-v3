// npm
import multer, { StorageEngine } from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import { mkdirp } from "mkdirp";
import { v4 as uuidv4 } from "uuid";

// components
import Utils from "./Utils";

export interface File {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
}

export const storage: StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(
      "Storage.ts",
      req.body.type,
      Utils.imagePathtype[req.body.type]
    );
    if (!req.body.type || !Utils.imagePathtype[req.body.type]) return;
    const uploadDir = Utils.imagePathtype[req.body.type];
    mkdirp(uploadDir).then((res) => {
      cb(null, uploadDir);
    });
  },
  filename: (req, file, cb) => {
    const extension = file.mimetype.split("/")[1];
    cb(null, `${uuidv4()}.${extension}`);
  },
});

export const upload = multer({ storage: storage });

export function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const filePath = file.path;
    const extension = file.mimetype.split("/")[1];
    const outputPath = path.join(
      path.dirname(filePath),
      `compressed-${uuidv4()}.${extension}`
    );
    sharp(filePath)
      .resize({ width: 300, height: 300 })
      .toFile(outputPath, (err, info) => {
        if (err) {
          console.error(err);
          reject(new Error("Error resizing image"));
          return;
        }
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(err);
            reject(new Error("Error deleting original image"));
          } else {
            resolve(path.basename(outputPath));
          }
        });
      });
  });
}

const Storage = {
  storage,
  resizeImage,
  upload,
};

export default Storage;
