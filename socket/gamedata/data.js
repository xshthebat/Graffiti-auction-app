let rooms = [];
let roomstate = [];
let roomimg = [];
let names = {};
let roomtimer = [];
const gamestate = {
    getready: 0, //准备阶段
    start: 1, //开始阶段
    buy:2 //拍卖阶段
}
module.exports = {rooms,roomstate,roomimg,names,gamestate,roomtimer}