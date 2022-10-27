const mysql = require('mysql2');
// https://www.npmjs.com/package/mysql2
// require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10,
    dateString: true,
});

module.exports = pool.promise();

// Mysql Pool 用法
// async function main() {
//   // get the client
//   const mysql = require('mysql2');
//   // create the pool
//   const pool = mysql.createPool({host:'localhost', user: 'root', database: 'test'});
//   // now get a Promise wrapped instance of that pool
//   const promisePool = pool.promise();
//   // query database using promises
//   // rows :>> 資料(data) / fields :>> 本次資料庫操作的額外資料(meta data)
//   const [rows,fields] = await promisePool.query("SELECT 1");
// }

// Prepared Statement
// 防止 SQL Injection 攻擊 (攻擊原理 :>> 利用傳入 data 轉變成 sql syntax 的特性達成 / 防禦：把 data 和 syntax 分開傳送)
// https://stackoverflow.com/questions/8263371/how-can-prepared-statements-protect-from-sql-injection-attacks
