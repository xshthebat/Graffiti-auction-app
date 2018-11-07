let io = require('../socket/io');
let getimg = require('../../data/getgamedata');
let { rooms, roomstate, roomimg, gamestate, roomtimer } = require('../gamedata/data.js');
const wordnum = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
const handlenum = [`请注意'线索'按钮，里面的信息非常重要!`, `请注意'道具'按钮，里面有许多好玩的东西!`, `请注意'银行'按钮，当你钱不够时可以先借点`, '', '', '', '', '', '', '']
const ready = (socket) => {
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
            //初始化画作
            let imgdata = getimg(num);
            //乱序数组；
            rooms[socket.room - 1].pictures = [];
            rooms[socket.room - 1].forEach((item, index) => {
                // console.log(item);
                if (item) {
                    item.property = {
                        freeze: 2,
                        clues: 1,
                        pin: 2
                    };
                    // console.log('item.name', item.name);
                    item.picture = [{ user: item.name, ...imgdata.img[index][0] }, { user: item.name, ...imgdata.img[index][1] }];
                    rooms[socket.room - 1].pictures.push(item.picture);
                    item.money = 3000;
                    item.getpicture = [];
                    item.borrowmoney = 0;
                    item.clues = [imgdata.hint[2*((index+1)%num)], imgdata.hint[2*((index+1)%num)+1]]
                }
            })
            roomstate[socket.room - 1] = gamestate.start; //游戏开始

            io.in(socket.room).emit('gamestart');
            //初始化所有人状态
            io.in(socket.room).emit('getpersons', rooms[socket.room - 1].map(item => {
                return {
                    name: item.name,
                    position: item.position,
                    property: item.property,
                    picture: item.picture,
                    money: item.money,
                    getpicture: item.getpicture,
                    borrowmoney: item.borrowmoney,
                    clues: item.clues
                }
            }));
            let getter = -1;
            rooms[socket.room - 1].forEach((item, _index) => {
                if (item) {
                    let time = 10;
                    let primise = new Promise((res, rej) => {
                        console.log(roomtimer[socket.room - 1][_index]);
                        roomtimer[socket.room - 1][_index].timer = setInterval(() => {
                            item.emit('readytime', time);
                            time--;
                            if (time === 0) {
                                clearInterval(roomtimer[socket.room - 1][_index].timer);
                                res()
                            }
                        }, 1000);
                    })
                    primise.then(() => {
                        return new Promise((res, rej) => {
                            item.emit('drawstart');
                            let drawtime = 240  //默认120
                            roomtimer[socket.room - 1][_index].newtimer = setInterval(() => {
                                item.emit('drawtime', drawtime);
                                // console.log(drawtime);
                                drawtime--;
                                if (roomimg[socket.room - 1].length === 2 * num) {
                                    console.log('全部完成')
                                    console.log(rooms[socket.room - 1].pictures);
                                    item.emit('drawtimeout', drawtime);
                                    //这里对画作处理
                                    let imgs = [];
                                    rooms[socket.room - 1].pictures.forEach(ele => {
                                        imgs = imgs.concat(ele);
                                    })
                                    item.emit('buystart', imgs);
                                    setTimeout(() => {
                                        if (roomstate[socket.room - 1] !== gamestate.buy) {
                                            roomstate[socket.room - 1] = gamestate.buy
                                            //执行拍卖函数
                                            console.log('房间状态变更')
                                        }
                                    }, 1000);
                                    res(imgs);
                                    clearInterval(roomtimer[socket.room - 1][_index].newtimer);
                                }
                                if (drawtime === -1) {
                                    console.log('时间到');
                                    clearInterval(roomtimer[socket.room - 1][_index].newtimer);
                                    //轮询等待 后续 上传完
                                    item.emit('drawtimeout', drawtime);
                                    roomtimer[socket.room - 1][_index].timerr = setInterval(() => {
                                        if (roomimg[socket.room - 1].length === 2 * num) {
                                            console.log('全部完成')
                                            console.log(rooms[parseInt(socket.room) - 1].pictures);
                                            let imgs = [];
                                            rooms[socket.room - 1].pictures.forEach(ele => {
                                                imgs = imgs.concat(ele);
                                            })
                                            item.emit('buystart', imgs);
                                            setTimeout(() => {
                                                if (roomstate[socket.room - 1] !== gamestate.buy) {
                                                    roomstate[socket.room - 1] = gamestate.buy

                                                }
                                            }, 1000);
                                            res(imgs);
                                            clearInterval(roomtimer[socket.room - 1][_index].timerr);
                                        }
                                    }, 50);
                                }
                            }, 1000)
                        })
                    }).then((imgs) => {
                        //游戏进程开始
                        let index = 0;
                        let init = false
                        let time = 25;
                        let imgsmessage = [];
                        imgsmessage.push(`拍卖师:  铛铛铛! 拍卖开始! 首先是拍卖的是本场第一幅作品~`);
                        for (let i = 0; i < imgs.length - 2; i++) {

                            imgsmessage.push(`拍卖师:  接下来是本场第${wordnum[i + 1]}幅大作登场,${handlenum[i]}`);
                        }
                        imgsmessage.push(`拍卖师:  铛铛铛!  现在是本场最后一幅作品 请抓紧机会`);
                        roomtimer[socket.room - 1][_index].timerrr = setInterval(() => {
                            // if(time===14){
                            //     item.emit('sendmessage', `${rooms[socket.room - 1][getter].name}一次`);
                            // }
                            // if(time===11){
                            //     item.em&& getter === _index)it('sendmessage', `${rooms[socket.room - 1][getter].name}两次`);
                            // }
                            // if(time===8){
                            //     item.emit('sendmessage', `${rooms[socket.room - 1][getter].name}三次`);
                            // }
                            // if(time===5){
                            //     item.emit('sendmessage', `${rooms[socket.room - 1][getter].name}成交`);
                            // }
                            if (time === 1) {
                                if (getter !== -1 && getter === _index) {
                                    rooms[socket.room - 1][getter].money = rooms[socket.room - 1][getter].money - imgs[index].newpirce;
                                    rooms[socket.room - 1][getter].getpicture.push(imgs[index]); //拍得画作
                                    //计算价值
                                    rooms[socket.room - 1][getter].money = rooms[socket.room-1][getter].money + imgs[index].value;
                                    // console.log(index/2);
                                    if(getter!==Math.floor(index/2)){
                                        rooms[socket.room - 1][Math.floor(index/2)].money = rooms[socket.room-1][Math.floor(index/2)].money + imgs[index].newpirce;
                                        rooms[socket.room - 1][Math.floor(index/2)].emit('sendmessage',`恭喜你收入${imgs[index].newpirce}元`);
                                        console.log('自己买自己没有价钱');   
                                    }
                                    io.in(socket.room).emit('getpersons', rooms[socket.room - 1].map(item => {
                                        return {
                                            name: item.name,
                                            position: item.position,
                                            property: item.property,
                                            picture: item.picture,
                                            money: item.money,
                                            getpicture: item.getpicture,
                                            borrowmoney: item.borrowmoney,
                                            clues: item.clues
                                        }
                                    }));
                                    io.in(socket.room).emit('sendmessage', `拍卖师:  恭喜${rooms[socket.room - 1][getter].name}以${imgs[index].newpirce}拍得价值为${imgs[index].value}的作品 ${(imgs[index].newpirce-imgs[index].value)<0?'获利':'亏损'}${Math.abs(imgs[index].newpirce-imgs[index].value)}元`);
                                    io.in(socket.room).emit('sendimgmessage', `拍卖师:  恭喜${rooms[socket.room - 1][getter].name}以${imgs[index].newpirce}拍得价值为${imgs[index].value}的作品 ${(imgs[index].newpirce-imgs[index].value)<0?'获利':'亏损'}${Math.abs(imgs[index].newpirce-imgs[index].value)}元`);
                                } else if(getter===-1){
                                    item.emit('sendimgmessage', `拍卖师:  此画流拍`);
                                    getter ===-2;
                                } 
                            }
                            if (time === 0) {
                                //结算本次拍卖信息
                                if (index !== imgs.length - 1) {
                                    index++;
                                    init = false;
                                    time = 25;
                                    getter = -1;
                                    console.log('拍卖成功');
                                } else {
                                    //游戏结束 给客户端送去游戏内信息结算
                                    if(roomstate[socket.room-1]!==gamestate.end){
                                        roomstate[socket.room-1] = gamestate.end
                                    }
                                    io.in(socket.room).emit('buyend');
                                    io.in(socket.room).emit('getpersons', rooms[socket.room - 1].map((item) => {
                                            return {
                                                name: item.name,
                                                position: item.position,
                                                property: item.property,
                                                picture: item.picture,
                                                money: item.money-item.borrowmoney,
                                                getpicture: item.getpicture,
                                                borrowmoney: item.borrowmoney,
                                                clues: item.clues
                                            }
                                        }));
                                    roomtimer[socket.room-1].forEach(obj => {
                                        for(var key in obj){
                                            if(obj[key]){
                                                clearInterval(obj[key]);
                                            }
                                        }
                                    });
                                }
                            }
                            if (!init) {
                                item.emit('sendmessage', imgsmessage[index]);
                                item.emit('setpicuresindex', index);
                                io.in(socket.room).emit('setgetters', -1);
                                getter = -1;
                                item.emit('setpicurespirce', imgs[index].pirce);
                                item.on('setprice', (price) => {
                                    getter = item.position - 1;
                                    console.log(getter, price);
                                    io.in(socket.room).emit('setgetters', item.position - 1);
                                    imgs[index].newpirce = price;
                                    io.in(socket.room).emit('setpicurespirce', price);
                                })
                                item.on('pin',(obj)=>{
                                    if(rooms[socket.room-1][obj.getter].money>=obj.pirce){
                                        console.log('钉子使用成功',_index,obj.getter);
                                        getter = obj.getter;
                                        console.log(getter,obj.pirce);
                                        io.in(socket.room).emit('setgetters', getter);
                                        imgs[index].newpirce = obj.pirce;
                                        io.in(socket.room).emit('setpicurespirce', obj.pirce);   
                                        item.emit('pinout',true);

                                    } else{
                                        item.emit('pinout',false);
                                    }
                                    console.log('对应道具-1');
                                    rooms[socket.room - 1][_index].money = rooms[socket.room - 1][_index].money - 100; //道具扣费
                                    rooms[socket.room - 1][_index].property.pin = rooms[socket.room - 1][_index].property.pin-1;
                                    io.in(socket.room).emit('getpersons', rooms[socket.room - 1].map((item) => {
                                        return {
                                            name: item.name,
                                            position: item.position,
                                            property: item.property,
                                            picture: item.picture,
                                            money: item.money,
                                            getpicture: item.getpicture,
                                            borrowmoney: item.borrowmoney,
                                            clues: item.clues
                                        }
                                    }));
                                })
                                item.on('freeze',(index)=>{
                                    rooms[socket.room - 1][_index].emit('freezesuccess');
                                    rooms[socket.room - 1][index].emit('freeze');
                                    rooms[socket.room - 1][_index].money = rooms[socket.room - 1][_index].money - 100; //道具扣费
                                    rooms[socket.room - 1][_index].property.freeze = rooms[socket.room - 1][_index].property.freeze-1;
                                    io.in(socket.room).emit('getpersons', rooms[socket.room - 1].map((item) => {
                                        return {
                                            name: item.name,
                                            position: item.position,
                                            property: item.property,
                                            picture: item.picture,
                                            money: item.money,
                                            getpicture: item.getpicture,
                                            borrowmoney: item.borrowmoney,
                                            clues: item.clues
                                        }
                                    }));
                                })
                                item.on('addclues',()=>{
                                    item.clues.push(imgdata.hint[2*((_index+2)%num)]);
                                    rooms[socket.room - 1][_index].money = rooms[socket.room - 1][_index].money - 100; //道具扣费
                                    rooms[socket.room - 1][_index].property.clues = rooms[socket.room - 1][_index].property.clues-1;
                                    io.in(socket.room).emit('getpersons', rooms[socket.room - 1].map((item) => {
                                        return {
                                            name: item.name,
                                            position: item.position,
                                            property: item.property,
                                            picture: item.picture,
                                            money: item.money,
                                            getpicture: item.getpicture,
                                            borrowmoney: item.borrowmoney,
                                            clues: item.clues
                                        }
                                    }));
                                })
                                item.on('getmoney', (index) => {
                                    rooms[socket.room - 1][index].money = rooms[socket.room - 1][index].money + 1000;
                                    rooms[socket.room - 1][index].borrowmoney = rooms[socket.room - 1][index].borrowmoney + 1100;
                                    //所有人改
                                    io.in(socket.room).emit('getpersons', rooms[socket.room - 1].map((item) => {
                                        return {
                                            name: item.name,
                                            position: item.position,
                                            property: item.property,
                                            picture: item.picture,
                                            money: item.money,
                                            getpicture: item.getpicture,
                                            borrowmoney: item.borrowmoney,
                                            clues: item.clues
                                        }
                                    }));
                                    item.emit('getmoney');
                                })
                                init = true;
                            }
                            time--;
                        }, 1500)
                    })
                }
            })

        }
    })
}
module.exports = ready;