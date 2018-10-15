const server = require('./server.js');
let io = require('socket.io')(server);
io.on('connect', (socket) => {
    console.log('a user connected', socket.id);
});
io.on('connection', function (socket) {
    require('../gamehandle/joinroom')(socket); //加入房间
    require('../gamehandle/sendmessage')(socket); //发送消息
    require('../gamehandle/sendvideo')(socket); //发送音频
    require('../gamehandle/getready')(socket); //发送位置准备信息
    require('../gamehandle/ready.js')(socket); //发送位置准备信息
    require('../gamehandle/disconnect')(socket); //退出房间
})
module.exports =io;