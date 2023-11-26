@echo off
call npm run runMemcached
pm2 start -i 8 --name server dist/index.js
