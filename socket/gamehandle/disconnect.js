let io = require('../socket/io');
let {rooms,roomstate,roomimg,names,roomtimer}=require('../gamedata/data.js');
const disconnect = (socket)=>{
    socket.on('disconnect', () => {
        socket.leave(socket.room)
        console.log(socket.name + '离开房间' + socket.room);
        delete names[socket.id];
        io.in(socket.room).emit('sendmessage', socket.name + '离开房间');
        if(rooms[socket.room - 1]!==0){
            console.log('强制退出');
            roomtimer[socket.room-1].forEach(obj => {
                for(var key in obj){
                    if(obj[key]){
                        clearInterval(obj[key]);
                    }
                }
            });
            io.in(socket.room).emit('theonequite');
        }
        console.log(roomstate[socket.room - 1]);
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
            roomtimer.splice(socket.room - 1, 1);
            rooms.splice(socket.room - 1, 1);
            roomstate.splice(socket.room - 1, 1);
            roomimg[socket.room - 1] = [];//清空房间图片

            console.log('清空房间' + socket.room);
        }
    })
}
module.exports = disconnect;