'use strict';
var assert = require('assert');
var Duiba = require('../');

describe('Duiba', function(){
    describe('#buildUrlWithSign', function(){
        let appKey = 'testappkey';
        let appSecret = 'testappsecret';
        let timestamp = 1457409005493;

        it('参数 params.redirect 缺失，输出url不带redirect', function(){
            let url = Duiba.buildUrlWithSign(
                appKey,
                appSecret,
                {
                    'uid': 'plusman',
                    'credits': 2000,
                    'timestamp': timestamp
                }
            );

            let expected = `http://www.duiba.com.cn/autoLogin/autologin?uid=plusman&credits=2000&timestamp=${timestamp}&appKey=testappkey&sign=de02a5b5a24660d6999109b466ff6a51`;
            assert.equal(
                url, 
                expected
            );
        });


        it('参数含 params.redirect，输出url带redirect', function(){
            let url = Duiba.buildUrlWithSign(
                appKey,
                appSecret,
                {
                    'uid': 'plusman',
                    'credits': 2000,
                    'redirect': 'http://www.plusman.cn',
                    'timestamp': timestamp
                }
            );

            let expected = `http://www.duiba.com.cn/autoLogin/autologin?uid=plusman&credits=2000&redirect=http%3A%2F%2Fwww.plusman.cn&timestamp=${timestamp}&appKey=testappkey&sign=7d748e19f290bc076542d8b27442cf3c`;
            assert.equal(
                url, 
                expected
            );
        });
    });


    describe('#genSign', function(){
        let appSecret = 'testappsecret';
        let appKey = 'testappkey';
        
        it('只有一个appKey时的签名', function(){
            let queryString = `appKey=${appKey}`;
            let md5Sign = Duiba.genSign(queryString, appSecret);
            assert.equal(md5Sign, '925e68506cf5a9ac740aedc2bd78f5e4');
        });

        it('多个参数的签名 appKey, timestamp', function(){
            let queryString = `appKey=${appKey}&timestamp=1415250311646`;
            let md5Sign = Duiba.genSign(queryString, appSecret);
            assert.equal(md5Sign, '868a4339ea0400aec9b7a4742e06120e');
        });

        it('含有中文参数的签名,appKey="testappkey" description="兑吧"', function(){
            let queryString = `appKey=${appKey}&description=兑吧`;
            let md5Sign = Duiba.genSign(queryString, appSecret);
            assert.equal(md5Sign, '54432c8d6f76246d5890f05b7df0182f');
        });
    });


    describe('#parseCreditConsume', function(){
        let appSecret = 'testappsecret';
        
        it('参数正确，sign_pass 返回 true', function(){
             let urlQuery = 'uid=plusman&orderNum=order-for-test-1457357341453&credits=500&params=admin%40duiba.com%3A%E5%85%91%E5%90%A7&type=alipay&ip=192.168.1.100&paramsTest59=59&sign=2b7feb4bd80462efbc6b54b3315783be&timestamp=1457357341453&waitAudit=true&actualPrice=500&description=%E6%94%AF%E4%BB%98%E5%AE%9D%E8%B4%A6%E5%8F%B7%EF%BC%9Aadmin%40duiba.com%28%E5%85%91%E5%90%A7%29+%E8%BD%AC%E8%B4%A6%E5%85%85%E5%80%BC%EF%BC%9A5%E5%85%83&facePrice=500&appKey=38NRCZ798rdwpXW3ADf6gChekRzB&';
             let verifyRes = Duiba.parseCreditConsume(urlQuery, appSecret);
             assert.equal(verifyRes.sign_pass, true);
             assert.equal(typeof verifyRes.params, 'object');
        });

        it('参数uid更改为xiaoming, sign_pass 返回 false', function(){
             let urlQuery = 'uid=xiaoming&orderNum=order-for-test-1457357341453&credits=500&params=admin%40duiba.com%3A%E5%85%91%E5%90%A7&type=alipay&ip=192.168.1.100&paramsTest59=59&sign=2b7feb4bd80462efbc6b54b3315783be&timestamp=1457357341453&waitAudit=true&actualPrice=500&description=%E6%94%AF%E4%BB%98%E5%AE%9D%E8%B4%A6%E5%8F%B7%EF%BC%9Aadmin%40duiba.com%28%E5%85%91%E5%90%A7%29+%E8%BD%AC%E8%B4%A6%E5%85%85%E5%80%BC%EF%BC%9A5%E5%85%83&facePrice=500&appKey=38NRCZ798rdwpXW3ADf6gChekRzB&';
             let verifyRes = Duiba.parseCreditConsume(urlQuery, appSecret);
             assert.equal(verifyRes.sign_pass, false);
             assert.equal(typeof verifyRes.params, 'object');
        });
    });


    describe('#responseCreditConsume', function(){
        let bizId = 'souche-coin-test-1001';

        it('status 为 ok，应返回 ok 的正确格式', function(){
            let response = Duiba.responseCreditConsume('ok', 10, {
                bizId: bizId
            });
            assert.equal(JSON.stringify(response), '{"status":"ok","errorMessage":"","bizId":"souche-coin-test-1001","credits":10}');
        });

        it('status 为 fail，应返回 fail 的错误格式', function(){
            let response = Duiba.responseCreditConsume('fail', 10, {
                errorMessage: 'fail 用例测试'
            });
            assert.equal(JSON.stringify(response), '{"status":"fail","errorMessage":"fail 用例测试","credits":10}');
        });

        it('status 为 unKnown, 应抛出"status 不存在，可选值为 ok 或 fail"错误', function(){
            assert.throws(function(){
                Duiba.responseCreditConsume('unKnown', 10);
            }, function(err){
                return err.message === 'status 不存在，可选值为 ok 或 fail';
            });
        });
    });

    describe('#parseCreditNotify', function(){
        let appSecret = 'testappsecret';

        it('参数正确，sign_pass 返回 true',function(){
            let urlQuery = 'sign=8e2a9698ea70e71263e000cf21a4d180&timestamp=1457366772233&errorMessage=%E5%A4%B1%E8%B4%A5%E7%9A%84%E8%AF%9D%E8%BF%99%E9%87%8C%E4%BC%9A%E8%BF%94%E5%9B%9E%E9%94%99%E8%AF%AF%E5%8E%9F%E5%9B%A0&orderNum=order-for-test-1457357341453&paramsTest35=35&bizId=souche-coin-test-1001&success=true&appKey=38NRCZ798rdwpXW3ADf6gChekRzB&';

             let verifyRes = Duiba.parseCreditNotify(urlQuery, appSecret);
             assert.equal(verifyRes.sign_pass, true);
             assert.equal(typeof verifyRes.params, 'object');
        });
    });

    describe('#responseCreditNotify', function(){
        it('返回字符串ok',function(){
            assert.equal(Duiba.responseCreditNotify(), 'ok');
        });
    });
});
