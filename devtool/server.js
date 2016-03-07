// 用于进行服务器响应测试
'use strict';
var http = require('http');

const PORT = 8080;

http.createServer(function(req, res){
    console.log('URL: ');
    console.log(req.url);
    console.log('Headers:');
    console.log(req.rawHeaders);
    res.end(JSON.stringify({
        'status': 'fail',
        'errorMessage': '参数收集用例',
        'credits': '0'
    }));
}).listen(PORT, function(){
    console.log('Server listen on port ' + PORT);
});
