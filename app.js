const express = require('express');
const multipart = require('connect-multiparty');
const fs = require('fs');
let multipartMiddleware = multipart();
let rooms = [];
let roomstate = [];
let names = {};
let app = express();
const gamestate = {
    getready: 0, //准备阶段
    start: 1 //开始阶段
}
app.use(express.static('public'));
app.use(multipart({ uploadDir: 'public' }));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
})
app.post('/postvideo', function(req, res, next) {
        console.log(req.files.video);
        if (req.files.video) {
            fs.rename(req.files.video.path, req.files.video.path + '.webm', () => {
                res.json({ err: false, src: req.files.video.path + '.webm' });

            })
        }
    })
    // app.get('/getvideo', function(req, res) {
    //     if (req.query.src) {

//     } else {
//         res.json({ err: true, errtype: 'parrmerr' });
//     }
// })

app.get('/getroom', function(req, res, next) {
    let room = {
        room: undefined,
        position: undefined,
        join: false
    }
    if (rooms.length) {
        //存在就遍历
        rooms.forEach((val, index) => {
            //若房间存在,并且未开始游戏
            if (val && roomstate[index] === gamestate.getready) {
                val.forEach((vals, indexs) => {
                    if (vals === 0 && !room.join) {
                        rooms[index][indexs] = 1
                        room.room = index + 1;
                        room.position = indexs + 1;
                        room.join = true;
                    }
                })
            }
        })
        if (!room.join) {
            rooms.push([0, 0, 0, 0, 0]); //建房
            roomstate.push(gamestate.getready); //房间游戏状态
            rooms.forEach((val, index) => {
                if (val && roomstate[index] === gamestate.getready) {
                    val.forEach((vals, indexs) => {
                        if (vals === 0 && !room.join) {
                            rooms[index][indexs] = 1
                            room.room = index + 1;
                            room.position = indexs + 1;
                            room.join = true;
                        }
                    })
                }
            })
        }
    } else {
        rooms.push([0, 0, 0, 0, 0]); //推入5位数组
        roomstate.push(gamestate.getready); //房间游戏状态
        rooms[0][0] = 1;
        room.room = 0 + 1;
        room.position = 0 + 1;
        room.join = true;
    }
    res.send(room);
});
app.get('/getsoketname', function(req, res) {
    let name = req.query.name;
    console.log(names, name);
    for (let key in names) {
        console.log(names[key], name);
        if (names[key] === name) {
            res.json({ err: true, errtype: 'has name' })
            return;
        }
    }
    res.send({ err: false, data: 'ok' });
})
let server = require('http').createServer(app);
let io = require('socket.io')(server);
io.on('connect', (socket) => {
    console.log('a user connected', socket.id);
});
io.on('connection', function(socket) {
    socket.on('joinroom', (data) => {
        console.log(data.name + '加入房间', data.room);
        socket.name = data.name;
        socket.room = data.room;
        socket.position = data.position;
        socket.state = 'getready'
        socket.join(data.room);
        names[socket.id] = data.name;
        io.in(data.room).emit('sendmessage', socket.name + '   加入房间');
        rooms[data.room - 1][data.position - 1] = socket; //记录 soket;
        io.in(socket.room).emit('getpersons', rooms[data.room - 1].map(item => {
            return {
                name: item.name,
                gamestate: item.state,
                position: item.position
            }
        }));
    })
    socket.on('sendmessage', (message, fn) => {
        console.log(socket.name + ':' + message);
        io.in(socket.room).emit('sendmessage', socket.name + ':  ' + message);
        fn();
    })
    socket.on('sendvideo', (src, fn) => {
        console.log(socket.name + ':' + src);
        io.in(socket.room).emit('sendvideo', socket.name + ':' + src);
        fn();
    })
    socket.on('ready', () => {
        socket.state = 'ready';
        io.in(socket.room).emit('getpersons', rooms[socket.room - 1].map(item => {
            return {
                name: item.name,
                gamestate: item.state,
                position: item.position
            }
        }));
        let num = 0;
        rooms[socket.room - 1].forEach((item) => {
            // console.log(item);
            if (item.state === 'ready') {
                num++;
            }
        })
        let allready = rooms[socket.room - 1].every((item) => {

                return item.state === 'ready' || item === 0;
            })
            // console.log(allready, num);
        if (allready && num >= 2) {
            console.log('房间' + socket.room + '开始游戏');
            rooms[socket.room - 1].forEach((item) => {
                // console.log(item);
                item.state = 'start';
                item.property = {
                    freeze: 2,
                    clues: 2,
                    pin: 2
                };
                item.picture = ['这是图1', '这是图2'];
                item.money = 3000;
                item.getpicture = [];
            })
            roomstate[socket.room - 1] = gamestate.start; //游戏开始

            io.in(socket.room).emit('gamestart');
            //初始化所有人状态
            io.in(socket.room).emit('getpersons', rooms[socket.room - 1].map(item => {
                return {
                    name: item.name,
                    gamestate: item.state,
                    position: item.position,
                    property: item.property,
                    picture: item.picture,
                    money: item.money,
                    getpicture: item.getpicture
                }
            }));
        }
    })
    socket.on('getready', () => {
        socket.state = 'getready';
        io.in(socket.room).emit('getpersons', rooms[socket.room - 1].map(item => {
            return {
                name: item.name,
                gamestate: item.state,
                position: item.position
            }
        }));
    })
    socket.on('disconnect', () => {
        socket.leave(socket.room)
        console.log(socket.name + '离开房间' + socket.room);
        delete names[socket.id];
        io.in(socket.room).emit('sendmessage', socket.name + '离开房间');
        rooms[socket.room - 1][socket.position - 1] = 0; //对应房间位置清空
        //判断房间是否为空 若为空 就删除房间
        io.in(socket.room).emit('getpersons', rooms[socket.room - 1].map(item => {
            return {
                name: item.name,
                gamestate: item.state,
                position: item.position
            }
        }));
        let ifnull = rooms[socket.room - 1].every((val) => {
            if (val === 0) {
                return true;
            } else {
                return false;
            }
        })
        if (ifnull) {
            rooms.splice(socket.room - 1, 1);
            roomstate.splice(socket.room - 1, 1);
            console.log('清空房间' + socket.room);

        }

    })
})
server.listen(8881);
console.log('running')