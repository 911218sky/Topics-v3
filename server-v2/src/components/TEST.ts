import Memcached from "memcached";
const memcached = new Memcached("localhost:11211", { remove: true });

memcached.add("456", 10, 10, (err, res) => {
  if (err) console.log(err);
  console.log(res);
  memcached.get("456", (err, data) => {
    if (err) console.log(err);
    else console.log(data);
    memcached.end();
  });
});
