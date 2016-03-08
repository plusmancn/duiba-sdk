'use strict';
var querystring = require('querystring');
var crypto = require('crypto');

var _ = require('lodash');

var ConfigUrl = require('./config/url.js');



/**
 * 生成免登录URL
 * 
 * @param {String} appKey `接口key`
 * eparam {String} appSecret `接口密匙`
 * @param {Object} params `如下`
 * ```
 * {
 *   {String} uid      `用户id （用not_login作为uid标记游客用户，详见 游客访问）`
 *   {Long}   credits    `用户积分余额`
 *   {String} redirect `回调url`
 *   {Long}   timestamp `1970-01-01开始的时间戳，毫秒为单位。`
 * }
 * ```
 */
function buildUrlWithSign(appKey, appSecret, params /*, callback*/ ){
    // callback = typeof callback === 'function' ? callback : (options || function(){});
    params.appKey = appKey;
    params.timestamp = params.timestamp || Date.now();
    
    // 生成sign
    params.sign = genSign(querystring.stringify(params), appSecret);

    var urlQuery = querystring.stringify(params);
    return  ConfigUrl.URL_AUTOLOGIN + '?' + urlQuery;
}


/**
 * 签名生成
 *
 * @param {String} urlQuery `url query 部分字符串`
 * @param {String} appSecret `帐号密匙`
 */
function genSign(urlQuery, appSecret){
    var urlObj = querystring.parse(urlQuery);
    urlObj.appSecret = appSecret;

    var keysSortAsc = Object.keys(urlObj).sort(function(a, b){
        return a.localeCompare(b);
    });
    var valueSortStr = keysSortAsc.map(function(key){
        return urlObj[key];
    }).join('');

    var md5 = crypto.createHash('md5');
    return md5.update(valueSortStr, 'utf8').digest('hex');
}


/**
 * 解析兑吧服务器积分扣除
 *
 * @param {String} urlQuery `url query 部分字符串`
 * @param {String} appSecret `帐号密匙`
 *
 */
function parseCreditConsume(/*urlQuery, appSecret*/){
    return _parseDuibaUrlQuery.apply(null, arguments);
}

/**
 * 兑换结果通知接口
 *
 * @param {String} urlQuery `url query 部分字符串`
 * @param {String} appSecret `帐号密匙`
 */
function parseCreditNotify(/*urlQuery, appSecret*/){
    return _parseDuibaUrlQuery.apply(null, arguments);
}


/** 
 * 积分扣除响应
 */
function responseCreditConsume(status, credits, options){
    options = options || {};
    if(status === 'fail'){
        return {
            status: status,
            errorMessage: options.errorMessage || '',
            credits: credits
        };
    }else if(status === 'ok'){
        return {
            status: status,
            errorMessage: options.errorMessage || '',
            bizId: options.bizId,
            credits: credits
        };
    }else{
        throw new Error('status 不存在，可选值为 ok 或 fail');
    }
}

/**
 * 通知响应接口
 */
function responseCreditNotify(){
    return 'ok';
}

/************ 私有函数 **************/
/**
 * 通用参数解析接口
 */
function _parseDuibaUrlQuery(urlQuery, appSecret){
    var urlObj = querystring.parse(_.trimEnd(urlQuery, '&'));
    var md5Sign = genSign(querystring.stringify(_.omit(urlObj,['sign'])), appSecret);

    // 将返回结果中的字符串 true/false，转换为 boolean 类型
    var TransDic = {
        'true': true,
        'false': false
    };
    for(var key in urlObj){
        var value = urlObj[key];
        urlObj[key] = typeof TransDic[value] === 'boolean' ? TransDic[value] : value;
    }

    if(md5Sign !== urlObj.sign){
        return {
            sign_pass: false,
            params: urlObj
        };
    }else{
        return {
            sign_pass: true,
            params: urlObj
        };
    }
}

module.exports = {
    buildUrlWithSign: buildUrlWithSign,
    genSign: genSign,
    parseCreditConsume: parseCreditConsume,
    parseCreditNotify: parseCreditNotify,
    responseCreditConsume: responseCreditConsume,
    responseCreditNotify: responseCreditNotify
};
