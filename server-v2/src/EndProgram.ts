import Prisma from "./components/Prisma";
import memcached from "./components/Memcached";
import { stopMemcached } from "./script/Memcached";

async function EndProgram() {
  await stopMemcached();
  await Prisma.$disconnect().then(() => {
    console.log("db disconnect...");
  });
  memcached.end();
}

export default EndProgram;
