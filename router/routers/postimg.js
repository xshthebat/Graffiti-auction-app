const fs = require('fs');
let {rooms,roomimg}=require('../../socket/gamedata/data.js');
const postimg = function (req, res) {
    console.log(req.query.rooms, req.query.num,req.files); //放入对应房间;
    if (req.files.img1 && req.files.img2 && req.query.rooms&& req.query.num) {
        //存入对应房间内
        let promise1 = new Promise((res, rej) => {
            fs.rename(req.files.img1.path, req.files.img1.path + '.png', (err) => {
                if (err) {
                    rej(err);
                }
                res(req.files.img1.path + '.png');

            })
        })
        let promise2 = new Promise((res, rej) => {
            fs.rename(req.files.img2.path, req.files.img2.path + '.png', (err) => {
                if (err) {
                    rej(err);
                }
                res(req.files.img2.path + '.png');

            })
        })
        Promise.all([promise1, promise2]).then(ress => {
            roomimg[parseInt(req.query.rooms) - 1] = roomimg[parseInt(req.query.rooms) - 1].concat(ress);
            rooms[parseInt(req.query.rooms)-1].pictures.forEach(item=>{
                if(item[0].user===req.query.num){
                    item[0].path = ress[0];
                    item[1].path = ress[1];
                }
            })
            res.json({ err: false, data: 'ok' });
        })

    }
}
module.exports = postimg;