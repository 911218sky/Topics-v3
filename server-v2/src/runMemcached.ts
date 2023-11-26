import { startMemcached } from "./script/Memcached";

startMemcached().then(() => {
    console.log("Memcached is run!!")
});