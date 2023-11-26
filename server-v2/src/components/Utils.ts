// npm
import { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import * as rateLimit from "express-rate-limit";

// components
import Prisma from "./Prisma";

// Type
import * as __UtilsType from "./type/UtilsType";
namespace Utils {
  export const Allowlist: string[] = ["http://localhost:5001"];
  export const imagePathtype: { [key: string]: string } = {
    userImg: "./uploads/image",
    gameImg: "./system/image/gameImg",
  };
  export import UtilsType = __UtilsType;

  export function setControlHeader(res: Response, clientUrl: string): void {
    res.setHeader("Access-Control-Allow-Origin", clientUrl);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
    );
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  export async function verifyIdentity(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const origin = req.headers?.origin;
    const referer = req.headers?.referer;
    if (
      (origin && Allowlist.includes(origin)) ||
      (referer && Allowlist.some((allowed) => referer.startsWith(allowed)))
    ) {
      Utils.setControlHeader(res, process.env.CLIENT_URL!);
      next();
    } else if (
      req.headers.device === "mobile"
    ) {
      Utils.setControlHeader(res, origin || referer || "");
      setTimeout(() => next(), 1000);
    } else {
      Utils.setControlHeader(res, origin || referer || "");
      next();
      // res.status(403).send("Forbidden");
    }
  }

  export function checkArrayLength(arr: any, minLength: number): boolean {
    return Array.isArray(arr) && arr.length >= minLength;
  }

  export function checkPermission(role: UtilsType.Role): boolean {
    return role !== "USER";
  }

  export function validateParameters(
    req: Request,
    requiredParams: string[],
    section: UtilsType.ValidatedSection
  ): boolean {
    for (const param of requiredParams) {
      switch (section) {
        case "body":
          if (req.body[param] === undefined || req.body[param] === null) {
            return false;
          }
          break;
        case "query":
          if (req.query[param] === undefined || req.query[param] === null) {
            return false;
          }
          break;
        case "headers":
          if (req.headers[param] === undefined || req.headers[param] === null) {
            return false;
          }
          break;
        case "params":
          if (req.params[param] === undefined || req.params[param] === null) {
            return false;
          }
          break;
        default:
          throw new Error("Invalid section");
      }
    }
    return true;
  }

  export function calculateTimeAfter(
    unit: UtilsType.TimeUnits,
    time: number
  ): Date {
    let milliseconds: number;
    switch (unit) {
      case "milliseconds":
        milliseconds = time;
        break;
      case "seconds":
        milliseconds = time * 1000;
        break;
      case "minutes":
        milliseconds = time * 60 * 1000;
        break;
      case "hours":
        milliseconds = time * 60 * 60 * 1000;
        break;
      case "days":
        milliseconds = time * 24 * 60 * 60 * 1000;
        break;
      case "months":
        milliseconds = time * 30 * 24 * 60 * 60 * 1000;
        break;
      case "years":
        milliseconds = time * 365 * 24 * 60 * 60 * 1000;
        break;
      default:
        throw new Error("Invalid time unit");
    }
    return new Date(Date.now() + milliseconds);
  }

  export function encryption(data: string, key: Buffer, iv: Buffer): string {
    const cipher = crypto.createCipheriv("aes-128-gcm", key, iv);
    return cipher.update(data, "utf8", "hex") + cipher.final("hex");
  }

  export function decrypt(data: string, key: Buffer, iv: Buffer): string {
    const decipher = crypto.createDecipheriv("aes-128-gcm", key, iv);
    return decipher.update(data, "hex", "utf8");
  }

  export function responseWrongParameter(
    res: Response,
    message: string = "wrong parameter",
    data?: any
  ) {
    return res.status(400).json({ message, ...data });
  }

  export function responseServerError(
    res: Response,
    message: string = "ServerError",
    data?: any
  ) {
    return res.status(500).json({ message, ...data });
  }

  export function responseSuccessfully(res: Response, data?: any) {
    return res.status(200).json(data);
  }

  export function compareType<T>(value: T, type: string): boolean {
    return typeof value === type;
  }

  export function passowrdHash(password: string): string {
    return crypto.createHash("sha3-256").update(password).digest("hex");
  }

  export function verifyPassword(
    userId: string | number,
    password: string
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      Prisma.user
        .findUnique({
          where: {
            id: +userId,
          },
          select: {
            password: true,
          },
        })
        .then((user) => {
          if (!user) return resolve(false);
          const hash = passowrdHash(password);
          resolve(hash === user.password);
        })
        .catch(reject);
    });
  }

  export function checkEmailExists(email: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      Prisma.user
        .findFirst({
          where: {
            email,
          },
        })
        .then((user) => {
          resolve(user ? true : false);
        })
        .catch(reject);
    });
  }

  export function generateRandomNumber(max: number, min: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  export function creatLimiter(
    passedOptions?: Partial<rateLimit.Options> | undefined
  ): rateLimit.RateLimitRequestHandler {
    return rateLimit.rateLimit({
      windowMs: 60 * 60 * 1000,
      max: 5,
      message: {
        message: "Too many requests and try again later",
      },
      keyGenerator: (req) => {
        return req.ip;
      },
      skip: (req) => {
        const startIndex = req.ip.lastIndexOf(":") + 1;
        const extractedIP = req.ip.substring(startIndex);
        return Utils.Allowlist.includes(extractedIP);
      },
      ...passedOptions,
    });
  }

  export async function clearFirebaseCloudMessagingToken(
    userId: number
  ): Promise<void> {
    await Prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        firebaseCloudMessagingToken: null,
      },
    });
    return;
  }

  export function filterObject<
    T extends Record<string, any>,
    K extends keyof T
  >(obj: T, keysToKeep: K[]): Pick<T, K> {
    const filteredObject = {} as Pick<T, K>;
    keysToKeep.forEach((key) => {
      filteredObject[key] = obj[key];
    });
    return filteredObject;
  }
}
export default Utils;
