// npm
import jwt, { VerifyErrors, SignOptions, JwtPayload } from "jsonwebtoken";
import { config } from "dotenv";

// Type
type TimeUnit = "ms" | "s" | "m" | "h" | "d";
config({ path: "./.env" });

namespace Jwt {
  export function generateJwt(
    payload: Object = {},
    expiresIn: `${number}${TimeUnit}` = "1h"
  ): string {
    const options: SignOptions = { algorithm: "HS256", expiresIn };
    const token = jwt.sign(payload, process.env.SECRET_KEY!, options);
    return token;
  }

  export function verifyJwt(token: string): Promise<JwtPayload> {
    return new Promise<JwtPayload>((resolve, reject) => {
      jwt.verify(
        token,
        process.env.SECRET_KEY!,
        (err: VerifyErrors | null, data: string | JwtPayload | undefined) => {
          if (err) reject(err);
          else resolve(data as JwtPayload);
        }
      );
    });
  }
}

export default Jwt;
