const express = require('express');
const multipart = require('connect-multiparty');
const postvideo = require('./routers/postvideo');
const postimg = require('./routers/postimg');
const getroom = require('./routers/getroom');
const getsoketname = require('./routers/getsoketname');
// let multipartMiddleware = multipart();  //文件解析
let app = express();
app.use(express.static('public'));  //设置静态目录
app.use(multipart({ uploadDir: 'public' }));   //设置文件存储位置
 //cros跨域设置
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}) 
//音频上传接口
app.post('/postvideo', postvideo);  
//图画上传接口
app.post('/postimg', postimg);
//获取房间
app.get('/getroom', getroom);
//检测是否存在用户
app.get('/getsoketname', getsoketname);
module.exports = app;