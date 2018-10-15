let server = require('./socket/socket/server.js'); //开启服务
require('./socket/socket/io.js'); //挂在socket服务
server.listen(8881);
console.log('running')