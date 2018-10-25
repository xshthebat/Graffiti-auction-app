let getdata = require('./getpicturedata');
let getimg = function(num){
    let data = getdata(2*num);
    let ret= {
        img:[],
        hint:[]
    };
    for(let i=0;i<2*num;i++){
        ret.hint.push(`关于${data[i].hint}的画价值${data[i].value}¥`);
        if(i%2!==0){
            continue;
        } else{
            ret.img.push([{ name:data[i].name,pirce:data[i].price, value:data[i].value },{ name:data[i+1].name,pirce:data[i+1].price, value:data[i+1].value }])
        }
    }
    console.log(ret.img);
    return ret;
}
module.exports = getimg