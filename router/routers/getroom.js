let {rooms,roomstate,roomimg,gamestate,roomtimer}=require('../../socket/gamedata/data.js');
const getroom = function (req,res) {
    console.log(res);
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
            roomimg[index] = []; //初始图片存储
            roomtimer[index] = [{},{},{},{},{}]; //初始化定时器程序
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
        roomimg[0] = []; //初始图片存储
        roomtimer[0] = [{},{},{},{},{}]; //初始化定时器
        rooms[0][0] = 1;
        room.room = 0 + 1;
        room.position = 0 + 1;
        room.join = true;
    }
    res.send(room);
}
module.exports = getroom;