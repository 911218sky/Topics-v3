import { exec } from "child_process";
import path from "path";

export async function startMemcached(): Promise<void> {
  const pids = await getMemcachedPids();
  if (pids.length > 1) await stopMemcached();
  if (pids.length === 1) return;
  const memcachedPath = path.join("memcached-amd64", "memcached.exe");
  exec(
    `${memcachedPath} -d`,
    (error: any, stdout: any, stderr: string | undefined) => {
      if (error) {
        console.error(`Error starting Memcached: ${error.message}`);
        return;
      }
      if (stderr && !stderr.includes("No error")) {
        console.error(`Error starting Memcached stderr: ${stderr}`);
        return;
      }
      console.log("Memcached has been started successfully.");
    }
  );
}

export async function stopMemcached(): Promise<void> {
  try {
    const pids = await getMemcachedPids();
    const promises = pids.map((pid) => stopProcessByPid(Number(pid)));
    await Promise.all(promises);
    console.log("All Memcached processes have been stopped.");
  } catch (error) {
    console.error("Error stopping Memcached processes:", error);
  }
}

export function getMemcachedPids(): Promise<string[]> {
  return new Promise((resolve) => {
    exec('tasklist | findstr "memcached.exe"', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error running tasklist: ${error.message}`);
        resolve([]);
        return;
      }
      if (stderr) {
        console.error(`stderr Error running tasklist: ${stderr}`);
        resolve([]);
        return;
      }
      const lines = stdout.split("\n");
      const pids: string[] = [];
      for (const line of lines) {
        if (!line.includes("memcached.exe")) continue;
        const parts = line.trim().split(/\s+/);
        if (parts.length < 2) continue;
        const pid = parts[1];
        pids.push(pid);
      }
      resolve(pids);
    });
  });
}

export function stopProcessByPid(pid: number | string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    exec(
      `taskkill /F /PID ${pid}`,
      (error: any, stdout: any, stderr: string | undefined) => {
        if (error) {
          console.error(
            `Error stopping process with PID ${pid}: ${error.message}`
          );
          reject(error);
          return;
        }
        if (stderr) {
          console.error(`Error stopping process with PID ${pid}: ${stderr}`);
          reject(stderr);
          return;
        }
        console.log(`Process with PID ${pid} has been stopped.`);
        resolve();
      }
    );
  });
}
