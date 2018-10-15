let io = require('../socket/io');
const sendmessage = (socket)=>{
    socket.on('sendmessage', (message, fn) => {
        console.log(socket.name + ':' + message);
        io.in(socket.room).emit('sendmessage', socket.name + ':  ' + message);
        fn();
    })
}
module.exports = sendmessage;