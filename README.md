# duiba-sdk
[![duiba-sdk](http://img.shields.io/npm/v/duiba-sdk.svg)](https://www.npmjs.org/package/duiba-sdk)
[![Build Status](https://travis-ci.org/plusmancn/duiba-sdk.svg?branch=master)](https://travis-ci.org/plusmancn/duiba-sdk) 
[![Dependency Status](https://david-dm.org/plusmancn/duiba-sdk.svg)](https://david-dm.org/plusmancn/duiba-sdk.svg)

## Installation
```sh
$ npm install duiba-sdk
```

## Document
### 初始化
```javascript
var Duiba = require('duiba-sdk');

let appKey = 'testappkey';
let appSecret = 'testappsecret';
let timestamp = 1457409005493;
```
### 用户登录积分商城
```javascript
let loginUrl = Duiba.buildUrlWithSign(
  appKey,
  appSecret,
  {
    'uid': 'plusman',
    'credits': 2000,
    'redirect': 'http://www.plusman.cn',
    'timestamp': timestamp
  }
)

// loginUrl:
// http://www.duiba.com.cn/autoLogin/autologin?uid=plusman&credits=2000&redirect=http%3A%2F%2Fwww.plusman.cn&timestamp=1457409005493&appKey=testappkey&sign=7d748e19f290bc076542d8b27442cf3c
```
### 扣除积分接口
```javascript
// 解析兑吧请求体
// 取出 urlQuery 部分，用户自己实现，末尾 & 符号带不带都可，程序会做兼容
let urlQuery = 'uid=plusman&orderNum=order-for-test-1457357341453&credits=500&params=admin%40duiba.com%3A%E5%85%91%E5%90%A7&type=alipay&ip=192.168.1.100&paramsTest59=59&sign=2b7feb4bd80462efbc6b54b3315783be&timestamp=1457357341453&waitAudit=true&actualPrice=500&description=%E6%94%AF%E4%BB%98%E5%AE%9D%E8%B4%A6%E5%8F%B7%EF%BC%9Aadmin%40duiba.com%28%E5%85%91%E5%90%A7%29+%E8%BD%AC%E8%B4%A6%E5%85%85%E5%80%BC%EF%BC%9A5%E5%85%83&facePrice=500&appKey=38NRCZ798rdwpXW3ADf6gChekRzB&'
let verifyRes = Duiba.parseCreditConsume(urlQuery, appSecret);
```
verifyRes 返回如下格式，**做具体业务操作前，请务必确认`sign_pass`是否为`true`**
```json
{
  "sign_pass": true,
  "params": {
    "uid": "plusman",
    "orderNum": "order-for-test-1457357341453",
    "credits": "500",
    "params": "admin@duiba.com:兑吧",
    "type": "alipay",
    "ip": "192.168.1.100",
    "paramsTest59": "59",
    "sign": "2b7feb4bd80462efbc6b54b3315783be",
    "timestamp": "1457357341453",
    "waitAudit": true,
    "actualPrice": "500",
    "description": "支付宝账号：admin@duiba.com(兑吧) 转账充值：5元",
    "facePrice": "500",
    "appKey": "38NRCZ798rdwpXW3ADf6gChekRzB"
  }
}
```
服务器对兑吧的请求做出响应
```javascript
// 成功响应
let response = Duiba.responseCreditConsume('ok', 10, {
    bizId: bizId
});

// 失败响应
let response = Duiba.responseCreditConsume('fail', 10, {
    errorMessage: 'fail 用例测试'
});
```
### 兑换结果通知接口
处理方式同扣除积分接口
```javascript
let urlQuery = 'sign=8e2a9698ea70e71263e000cf21a4d180&timestamp=1457366772233&errorMessage=%E5%A4%B1%E8%B4%A5%E7%9A%84%E8%AF%9D%E8%BF%99%E9%87%8C%E4%BC%9A%E8%BF%94%E5%9B%9E%E9%94%99%E8%AF%AF%E5%8E%9F%E5%9B%A0&orderNum=order-for-test-1457357341453&paramsTest35=35&bizId=souche-coin-test-1001&success=true&appKey=38NRCZ798rdwpXW3ADf6gChekRzB&';

let verifyRes = Duiba.parseCreditNotify(urlQuery, appSecret);
```
服务器做出响应
```javascript
let str = Duiba.responseCreditNotify();
// 返回字符串 ok
```

## Contribute
You're welcome to make pull requests!
