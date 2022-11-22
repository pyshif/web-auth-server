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

<p align="right">
    <a href="#目錄">回目錄</a>
</p>

## 運行

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

<p align="right">
    <a href="#目錄">回目錄</a>
</p>

## Google 第三方登入

<p align="right">
    <a href="#目錄">回目錄</a>
</p>

## 系統信發送功能

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