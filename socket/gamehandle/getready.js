let io = require('../socket/io');
let {rooms}=require('../gamedata/data.js');
const getready = (socket)=>{
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
}
module.exports = getready;