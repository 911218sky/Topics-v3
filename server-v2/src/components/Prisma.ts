import { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["error"],
});

export { Prisma };
export default prisma;
