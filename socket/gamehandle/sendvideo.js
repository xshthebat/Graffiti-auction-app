let io = require('../socket/io');
const sendvideo = (socket)=>{
    socket.on('sendvideo', (src, fn) => {
        console.log(socket.name + ':' + src);
        io.in(socket.room).emit('sendvideo', socket.name + ':' + src);
        fn();
    })
}
module.exports = sendvideo;