## 介紹

web-auth 以及 web-auth-server 是實作 JWT（Json Web Token）、Google Sign In 的『前端』和『後端專案』。

關於前端部分詳見：[https://github.com/pyshif/web-auth](https://github.com/pyshif/web-auth)

## 目錄

1. [安裝](#安裝)

2. [運行](#運行)

3. [專案結構](#專案結構)

    3-1. [環境變數](#環境變數)

    3-2. [伺服器運行](#伺服器運行)

    3-3. [主要代碼](#主要代碼)

4. [資料庫](#資料庫)

5. [API](#api)

6. [JWT 管理](#jwt-管理)

7. [Google 第三方登入](#google-第三方登入)

8. [系統信發送功能](#系統信發送功能)

9. [網站部署](#網站部署)

10. [使用技術](#使用技術)

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

    > 不使用時，務必執行 `npm stop` 終止伺服器運行

- 進入 Log 環境

    ```bash
    npm run log
    ```

<p align="right">
    <a href="#目錄">回目錄</a>
</p>

## 專案結構

### 環境變數

```graphql
.
├── config
│   └── env.js
├── .env.dev
├── .env.prod
└── .env.example
```

`.env.dev`、`.env.prod` 需自行依照 `.env.example` 建立

`config/env.js` 根據 `NODE_ENV=development`／`NODE_ENV=production` 來引入 `.env.dev`／`.env.prod` 環境

『環境變數』與『腳本命令』對應關係：

| env | npm |
|:---:|:---:|
| `.env.dev` | `npm start` |
| `.env.prod` | `npm run server` |


### 伺服器運行

```graphql
.
├── bin
│   └── www
└── ecosystem.config.js
```

`bin/www` 為 Node 伺服器啟動檔案

pm2 設定檔（`ecosystem.config.js`），詳細請參考 [官方文件](https://pm2.keymetrics.io/docs/usage/environment/)

### 主要代碼

```graphql
.
├── app.js - # 應用程式入口
├── middlewares - # 中間件
│   ├── jwt
│   │   └── auth.js
│   └── session.js
├── public - # 靜態資源
│   ├── index.html
│   ├── javascripts
│   └── stylesheets
├── routers - # API 路由
│   ├── auth
│   │   ├── forgot.js
│   │   ├── google.js
│   │   ├── index.js
│   │   ├── reset.js
│   │   ├── sign-in.js
│   │   ├── sign-out.js
│   │   ├── sign-up.js
│   │   ├── token.js
│   │   └── user.js
│   └── help
│       ├── index.js
│       └── tell-me.js
├── test - # RESTful API 測試
│   ├── auth
│   └── help
└── utils - # 通用工具
    ├── aws
    │   └── ses.js
    ├── db.js
    ├── jwt
    │   ├── secret.js
    │   └── token.js
    └── knex.js
```

| file/folder | description |
|-------------|-------------|
| `app.js` | 應用程式入口 |
| `middlewares/` | 中間件 |
| `public/` | 靜態資源 |
| `routers/` | 路由 |
| `test/` | RESTful API 測試 |
| `utils/` | 通用工具 |

<p align="right">
    <a href="#目錄">回目錄</a>
</p>

## 資料庫

```graphql
.
└── database
    └── web-auth.sql
```

<p align="right">
    <a href="#目錄">回目錄</a>
</p>

## API

API 目前共２大類：

- Auth：處理身份驗證、使用者資料
- Help：處理客服功能

```graphql
.
└── routers - # API 路由
    ├── auth
    │   ├── forgot.js
    │   ├── google.js
    │   ├── index.js
    │   ├── reset.js
    │   ├── sign-in.js
    │   ├── sign-out.js
    │   ├── sign-up.js
    │   ├── token.js
    │   └── user.js
    └── help
        ├── index.js
        └── tell-me.js
```

### Sign Up

- `POST /auth/signup/`

    新用戶『註冊』

    DB：Read, Create｜users

    成功：200 OK｜發送『Email 地址驗證連結（有效時長 15m）』至使用者信箱

- `GET /auth/signup/:token/`

    說明：新用戶『驗證 Email 地址』

    DB：Read, Update｜users.user_status_id

    成功：304 Redirect『前端登入頁』

### Sign In

- `POST /auth/signin/`

    說明：使用者『登入』

    DB：Read, Update | users.refresh_token

    成功：200 OK | Payload (AccessToken) | Set-Cookie (RefreshToken) 

### Google Sign In

- `POST /auth/google/popup/`

    說明：新用戶/使用者『第三方登入』

    DB：Create, Read, Update | users.refresh_token

    成功：200 OK | Payload (AccessToken) | Set-Cookie (RefreshToken)

### Token

- `GET /auth/token/`

    說明：驗證 Access Token 有效性

    DB：-

    成功：200 OK

- `GET /auth/token/new/`

    說明：驗證 Refresh Token 有效性，『生成新 Access Token』

    DB：Read

    成功：200 OK, Payload (AccessToken)

### Sign Out

- `DELETE /auth/signout/`

    說明：使用者『登出』

    DB：Read, Update｜users.refresh_token

    成功：204 OK | Set-Cookie (Clear RefreshToken)

### Forgot

- `POST /auth/forgot/`

    說明：使用者『忘記密碼』

    DB：Read

    成功：200 OK | 寄送『密碼重設連結（有效時長 15m）』至使用者信箱

- `POST /auth/forgot/:token`

    說明：使用者使用連結『修改密碼』

    DB：Update

    成功：200 OK

### Reset

- `POST /auth/reset/`

    說明：使用者登入狀態下『修改密碼』

    DB：Update | users.password

    成功：200 OK

### User

- `DELETE /auth/user/`

   說明：刪除使用者 

   DB：Delete

   成功：200 OK

- `POST /auth/user/name/`

    說明：更改使用者名稱

    DB：Update

    成功：200 OK

- `POST /auth/user/birthday/`

    說明：更改使用者生日

    DB：Update

    成功：200 OK

- `POST /auth/user/phone/`

    說明：更改使用者手機

    DB：Update

    成功：200 OK

- `POST /auth/user/gender/`

    說明：更改使用者性別

    DB：Update

    成功：200 OK

- `POST /auth/user/avatar/`

    說明：上傳使用者頭像

    DB：Update

    成功：200 OK

- `POST /auth/user/email/`

    說明：申請信箱地址更改

    DB：Read, Update | users.user_status_id

    成功：200 OK | 寄送『Email Address 驗證信（有效時長 15m）』至使用者新信箱

- `POST /auth/user/email/:token/`

    說明：使用者驗證新電子郵箱

    DB：Read, Update

    成功：304 Redirect『前端登入頁』

### Help

- `POST /help/tellme/`

    說明：使用者回饋訊息

    DB：-

    成功：200 OK | 將訊息寄發至客服信箱

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
| Load Balance | (ELB) |
| <ins>Server</ins> | <ins>EC2</ins> |
| <ins>DB</ins> | <ins>RDS</ins> |

1. ssh -> server

2. git clone web-auth-server

3. npm i -g pm2

4. npm i 

5. scp .env.prod

6. adjust ecosystem.config.js

7. npm start

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