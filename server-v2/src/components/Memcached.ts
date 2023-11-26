import Memcached from "memcached"; // 注意：不再使用 * as Memcached

type TABLE = "PUBLIC" | "WS" | "USER";

class MyMemcached {
  private memcached: Memcached;
  private tableToLifetime: Record<TABLE, number> = {
    PUBLIC: 60 * 5,
    WS: 60 * 5,
    USER: 60 * 5,
  };

  constructor(
    location: Memcached.Location,
    options?: Memcached.options | undefined
  ) {
    this.memcached = new Memcached(location, options);
  }

  // Stores a new value in Memcached.
  public async set(
    table: TABLE,
    key: string,
    value: any,
    lifetime: number = this.tableToLifetime[table]
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.memcached.set(`${table}${key}`, value, lifetime, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }

  // Get the value for the given key.
  public async get(table: TABLE, key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.memcached.get(`${table}${key}`, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }

  // Get the value and the CAS id.
  public async gets(
    table: TABLE,
    key: string
  ): Promise<{ [key: string]: any; cas: string }> {
    return new Promise((resolve, reject) => {
      this.memcached.gets(`${table}${key}`, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }

  // Retrieves a bunch of values from multiple keys.
  public async getMulti(
    table: TABLE,
    keys: string[]
  ): Promise<{ [key: string]: any }> {
    return new Promise((resolve, reject) => {
      this.memcached.getMulti(
        keys.map((key) => `${table}${key}`),
        (err, data) => {
          if (err) reject(err);
          else resolve(data);
        }
      );
    });
  }

  // Touches the given key.
  public async touch(
    table: TABLE,
    key: string,
    lifetime: number
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.memcached.touch(`${table}${key}`, lifetime, (err) => {
        if (err) reject(false);
        resolve(true);
      });
    });
  }

  // Replaces the value in memcached.
  public async replace(
    table: TABLE,
    key: string,
    value: any,
    lifetime: number = this.tableToLifetime[table]
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.memcached.replace(`${table}${key}`, value, lifetime, (err) => {
        if (err) reject(false);
        resolve(true);
      });
    });
  }

  //  Add the value, only if it's not in memcached already.
  public async add(
    table: TABLE,
    key: string,
    value: any,
    lifetime: number = this.tableToLifetime[table]
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.memcached.add(`${table}${key}`, lifetime, value, (err, result) => {
        if (err) reject(false);
        resolve(result);
      });
    });
  }

  // Add the value, only if it matches the given CAS value.
  public async cas(
    table: TABLE,
    key: string,
    cas: string,
    value: any,
    lifetime: number = this.tableToLifetime[table]
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.memcached.cas(
        `${table}${key}`,
        value,
        cas,
        lifetime,
        (err, result) => {
          if (err) reject(false);
          resolve(result);
        }
      );
    });
  }

  // Remove the key from memcached.
  public async del(table: TABLE, key: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.memcached.del(`${table}${key}`, (err, result) => {
        if (err) reject(false);
        resolve(result);
      });
    });
  }

  // Closes all active memcached connections.
  public end() {
    this.memcached.end();
  }
}
const memcached = new MyMemcached("localhost:11211", {
  remove: true,
  timeout: 1000,
  keyCompression: true,
});
export default memcached;

// References : https://www.npmjs.com/package/memcached
// memcached -m 64 -p 11211
// memcached stop
