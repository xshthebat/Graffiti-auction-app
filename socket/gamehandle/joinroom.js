let {rooms,names}=require('../gamedata/data');
let io = require('../socket/io');
const joinroom = (socket)=>{
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
    });
}
module.exports = joinroom;