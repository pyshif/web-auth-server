## 前言

## 專案發佈

<!-- ## 後端 API 路由 -->

## 專案架構

```
colorful-b
|
|-- bin/                # 執行檔，網站伺服器啟動檔 www 放置在此
|
|-- controllers/        # 業務邏輯接口
|
|-- database/           # 資料庫 .sql (給 git 整合)
|
|-- dng/                # 商品檔 (LightRoom .dng 濾鏡檔)
|
|-- download/           # 商品包壓縮檔 (快取客戶端下載過壓縮包)
|
|-- middlewares/        # 業務邏輯模組化、重構代碼
|
|-- node_modules/       # 套件
|
|-- public/             # 靜態資源服務
|
|-- routes/             # API 路由
|
|-- sessions/           # Session 檔案
|
|-- tool/               # 各種小工具 (資料庫模擬資料生成、修改、刪除...)
|
|-- utils/              # API 路由共用工具
|
|-- views/              # 頁面顯示，放 .pug 檔 (此專案用不到)
|
|-- app.js              # 主應用程式入口
|
|-- .env.example        # 專案 .env 建立指引
|
|-- .gitignore          # git 忽略檔案清單
|
|-- .prettierrc         # 專案代碼風格設定檔
|
|-- nodemon.json        # nodemon 套件設定檔
|
|-- package-lock.json   # 套件相依清單
|
|-- package.json        # 套件清單
|
|-- README.md           # 專案說明

```

## 專案腳本

## 版本控制

## 環境變數 .env

## 路由 Router

## 資料庫 MariaDB

## 如何啟動專案？

1. 確認電腦環境
    - git 版本: Mac `2.34.1`
    - nvm 版本: `0.39.1`
    - node 版本: `16.13.2`
    - mariadb 版本: `10.7.3`

2. 下載專案

        $ git clone https://github.com/MFEE222/colorful-b.git

    or

        $ git clone git@github.com:MFEE222/colorful-b.git

3. 套件安裝

        $ npm i

4. .env 環境建置

    依照 .env.example 建立

5. 資料庫啟動 

    此處介紹 CLI 的設定方式，也可透過其他 GUI 介面來設定（如：PHPMyAdmin）

    5.1 將 `mysqld` 服務運行起來

        $ mysqld

    5.2 進入 `mysql` CLI 介面

        $ mysql
    
    5.3 註冊使用者帳密、設定權限

        $ MariaDB [(none)] > CREATE USER 'your-user-name'@'localhost' IDENTIFIED BY 'your-user-password';

        $ MariaDB [(none)] > GRANT ALL ON flamboyant.* TO 'your-user-name'@localhost;

        # 使用者必須和 .env 中的設定一致

        $ MariaDB [(none)] > SELECT user, host FROM mysql.user;

        # 確認使用者建立成功

    5.4 匯入資料庫

        $ MariaDB [(none)] > source 'colorful-b/database/flamboyant.sql'

        # .sql 檔案路徑請依據自身專案放置位置調整

        $ MariaDB [(none)] > show databases;

        # 確認資料庫成功匯入

    5.5 離開 CLI 介面

        $ MariaDB [(none)] > exit;

6. 後端啟動

        $ npm start

        # 確認 server 運行在 .env 指定端口



## 開發中

## 待優化

## 待修正

## 技術文件

## API 概覽


API (RESTful json)
---


<!-- json -->
<!-- GET / PUT / POST / DELETE -->
/api/products       :>> 返回商品列表資料
/api/product/xxx    :>> 商品細節
/api/orders         :>> 訂單列表
/api/order/xxx      :>> 訂單細節
/api/


<!-- login register -->
<!-- order search -->
<!-- product search / filter -->
<!-- favorite, cart -->
<!-- checkout -->
<!-- download -->



## 商品資料 (單純的返回、搜尋、篩選)
- method: GET
- path: /food, /wedding, /negative, /scenary, /vintage, /... 
- query: ?keyword=
> 待討論回傳資料內容要有什麼，筆數要幾筆
> 應該要有的資料：資料 data / 描述資料的資料(資料的資訊) meta data (總筆數...)

## 蒐藏商品、購物車商品（登入狀態？）
- method: GET
- path: /favorite, /cart
- query: 
<!-- app.post('/products/favoriate' function (req, res, next) {
    req.post.
}) -->

<!-- app.router('/product')

app.get('/product', function (req, res, next) {
    const keyword = req.query.keyword;

    if (query) {
        const [rows, fileds] = await connection.execute(
            'SELECT * FROM products WHERE name LIKE %:keyword%'
        )

        res.render('product', rows);
        res.json(rows);
    }

    res.sendFile('product.html');
})

app.get('/product/:series') {
    conse keyword= req.query.keyword
} -->

## 商品細節（單純返回）
- method: GET
- path: /food, /wedding, /...
- path: /id, /productname, /
- query: ...
> 待討論：資料內容、回傳筆數、資料資訊、資料庫設計

## 訂單資料（單傳返回、搜尋、篩選）

## 訂單細節（單傳返回）

## 登入
- method: POST
- path: /member/signin
> 建議使用第三方 Google / Facebook / Twitter / Line / Telegram / Discord / QQ / ...
> 取得憑證、API Key
> 可以用 email or account 登入

## 忘記、重設密碼
- method: GET / PUT
- path: /member/reset
- query: ?account="chris"&auth=MY123I343134DJIJE3 
- data: email or account
> 給這個 URL 一個過期期限

## 註冊
- method: POST / PUT
- path: /member/signup
- query:
> 註冊完成寄發系統信

## 登出
- method: POST
- path: member/logout
- query:
> 刪除 session

## 會員資料
- method: GET / POST
- path: /member
- query:
> GET 取得資料，POST 修改會員資料

## 下載 (打包壓縮、下載、stream 流)
- method: GET
- path: /download
- query: 

## 付款
- method: GET
-
> 付款完成寄發系統信

## 追蹤器
- method: PUT
- path: /trace
> 定義回傳條件，達幾次之後就回傳商品資料

## 問題
- Express 如何紀錄登入狀態（Session）?
    > Express 如何讀取、寫入 Session
    > 使用 第三方套件提供的 session 中介函式

- Express 如何接收 POST, PUT, DELETE 傳送資料？
    > 訪問 request 物件取得？

- Express 要如何動態生成 router？
    > 用 query 解決

- Node.js 伺服器要怎麼建資料庫？

## 套件
- passport
https://github.com/mailgun/mailgun.js#install


## TODO
1. 前端要有什麼狀態，需要什麼資料，格式要怎樣
2. 需要驗證什麼，需要整理什麼資料，處理什麼動作

1. api/review

2. api/cart

3. api/product

4. api/product detail

5. api/profile

6. api/order

7. api/order detail