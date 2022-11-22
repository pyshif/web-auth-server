## 介紹

web-auth 以及 web-auth-server 是實作 JWT（Json Web Token）、Google Sign In 的『前端』和『後端專案』。

關於前端部分詳見：[https://github.com/pyshif/web-auth](https://github.com/pyshif/web-auth)

## 目錄

1. [安裝](#安裝)

> xampp, mariadb

2. [運行](#運行)

3. [專案結構](#專案結構)

    3-1. [環境變數](#環境變數)

    3-2. [設定檔](#設定檔)

4. [資料庫](#資料庫)

> xampp, mariadb

> mysql, knex, db, table, column

5. [API](#api)

> sign in, sign out , multer, 

6. [測試](#測試)

7. [JWT 管理](#jwt-管理)

> secret, jwt

8. [Google 第三方登入](#google-第三方登入)

9. [系統信發送功能](#系統信發送功能)

10. [網站部署](#網站部署)

> aws > pm2 > linux, rds

11. [使用技術](#使用技術)

## 安裝

1. Clone

    ```bash
    git clone https://github.com/pyshif/web-auth-server.git
    ```

2. 依照 `.env.example` 內容，建立 `.env.dev`、`.env.prod` 環境檔於專案目錄底下

3. 安裝 [XAMPP](https://www.apachefriends.org) 提供資料庫開發環境；正式環境請安裝 MariaDB。

    3-1. 自行建立資料庫使用者，並寫入環境檔中

    3-2. 將 `database/web-auth.sql` 匯入資料庫

> 如果你是 Homebrew 使用者，可以執行 `brew install xampp` 進行安裝

4. 安裝 pm2 來運行開發、正式環境
   
   ```bash
   npm i -g pm2
   ```

> pm2 詳細請參考 [官方文件](https://pm2.keymetrics.io)

<p align="right">
    <a href="#目錄">回目錄</a>
</p>

## 運行

```graphql
.
└── ecosystem.config.js
```

使用 `pm2` 管理伺服器運行，設定檔為 `ecosystem.config.js`

- 運行測試環境

    ```bash
    npm start
    ```

    > 運行後會直接執行 `pm2 log` 進入 Log 環境，`Ctrl-V` 可以跳出

- 運行正式環境

    ```bash
    npm run server
    ```

- 終止伺服器運行

    ```bash
    npm stop
    ```

- 進入 Log 環境

    ```bash
    npm run log
    ```

<p align="right">
    <a href="#目錄">回目錄</a>
</p>

## 專案結構

<p align="right">
    <a href="#目錄">回目錄</a>
</p>

## 資料庫

<p align="right">
    <a href="#目錄">回目錄</a>
</p>

## API

<p align="right">
    <a href="#目錄">回目錄</a>
</p>

## 測試

<p align="right">
    <a href="#目錄">回目錄</a>
</p>

## JWT 管理

```graphql
.
├── middlewares
│   └── jwt
│       └── auth.js
└── utils
    └── jwt
        ├── secret.js - # 生成密鑰
        └── token.js - # 生成/驗證 Token
```

> `middlewares/jwt/auth.js` 驗證 Access/Refresh/Google-ID Token 中間件

### Secret

使用 Node.js 內建 `crypto` 庫，生成 64 位元組密鑰，自行存儲至『環境變數』中 

<details>
<summary>密鑰生成範例</summary>

```js
const crypto = require('crypto');
require('../../config/env');

function generateRandomSecretKey() {
    return crypto.randomBytes(64).toString('hex');
}

const secretKey = generateRandomSecretKey();
console.log('secretKey :>> ', secretKey);

module.exports = { generateRandomSecretKey };
```

</details>

### Access Token

使用 `jsonwebtoken` 庫生成 Access Token，預設有效時長 15 分鐘

### Refresh Token

使用 `jsonwebtoken` 庫生成 Refresh Token，預設有效時長 90 天

> 當使用 Google 第三方登入時，使用 Google ID Token 取代原有 Refresh Token

<p align="right">
    <a href="#目錄">回目錄</a>
</p>

## Google 第三方登入

```graphql
.
└── middlewares
    └── jwt
        └── auth.js
```

> `middlewares/jwt/auth.js` 驗證 Access/Refresh/Google-ID Token 中間件

使用者登入流程主要在前端完成，後端負責驗證來自前端的 Google ID Token。

驗證使用 [Google Auth Library for Node.js](https://github.com/googleapis/google-auth-library-nodejs)

驗證通過後：

- 生成 Access Token、Refresh Token
- 存儲 Refresh Token 至資料庫
- 回傳 Access / Refresh Token（詳見 [JWT 管理](#jwt-管理)）

<details>
<summary>驗證 Google ID Token（中間件）</summary>

```js
// middlewares/jwt/auth.js
const { OAuth2Client } = require('google-auth-library');
const googleAuthClient = new OAuth2Client(process.env.GOOGLE_SIGNIN_CLIENT_ID);
async function authenticateGoogleIDToken(req, res, next) {
    const token = req.headers['authorization'].split(' ').pop();
    // console.log('token :>> ', token);
    if (!token) return res.status(401).end('please supply valid google-token!');

    await verifyGoogleIDToken(token, (err, user) => {
        if (err) return res.status(401).end(err.message);
        req.user = {
            ...user,
            token,
        };
        next();
    });
}
// common function
async function verifyGoogleIDToken(token, callback) {
    try {
        const ticket = await googleAuthClient.verifyIdToken({
            idToken: token,
            audience: [process.env.GOOGLE_SIGNIN_CLIENT_ID]
        });
        callback(null, ticket.getPayload());
    } catch (error) {
        callback(error, null);
    }
}
```

</details>

<p align="right">
    <a href="#目錄">回目錄</a>
</p>

## 系統信發送功能

```graphql
.
└── utils
    └── aws
        └── ses.js
```

使用 aws-sdk (v2.1148.0) 庫串接 AWS SES 服務 (api version 2010-12-01)

| API | Description |
|-----|-------------|
| `POST /auth/forgot` | 發送『重設密碼連結』至使用者信箱 |
| `POST /auth/google` | 首次登入，發送『歡迎加入信』至使用者信箱 |
| `POST /auth/signup` | 註冊成功，發送『信箱驗證連結』至使用者信箱 |
| `POST /auth/user/email` | 更改信箱，發送『信箱驗證連結』至使用者新信箱 |
| `POST /help/tellme` | 發送『使用者回饋』至客服信箱 |

<p align="right">
    <a href="#目錄">回目錄</a>
</p>

## 網站部署

網站部署使用 AWS 服務，整體架構流程如下：

| Item | AWS |
|:----:|:---:|
| DNS | Route 53 |
| CDN | CloudFront |
| Client | S3 |
| <ins>Server</ins> | <ins>EC2</ins> |
| <ins>DB</ins> | <ins>RDS</ins> |

### EC2

作業系統：CentOS Linux 7 (Core)

伺服器管理：Pm2 (v5.2.0)

### RDS

資料庫：MariaDB (v10.6.10)


<p align="right">
    <a href="#目錄">回目錄</a>
</p>

## 使用技術

後端環境、框架：Node.js (v16.15.0)、Express.js (v4.17.2)

伺服器管理：Pm2 (v5.2.0)

資料庫：MariaDB (v10.6.10, Linux)、Knex (v2.0)

[![node-js](readme/node-js.svg)](https://nodejs.org/en/)&ensp;
[![express-js](readme/express-js.svg)](https://expressjs.com)&ensp;
[![mariadb](readme/mariadb.svg)](https://mariadb.org)&ensp;
[![aws](readme/aws.svg)](https://aws.amazon.com)&ensp;
[![pm2](readme/pm2.svg)](https://pm2.keymetrics.io)&ensp;
[![knex](readme/knex-js.svg)](https://knexjs.org)&ensp;

<p align="right">
    <a href="#目錄">回目錄</a>
</p>