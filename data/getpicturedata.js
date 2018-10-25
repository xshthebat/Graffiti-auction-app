let data = require('./picturedata');
let Pictrue = require('./Picture');
let getdata = function(num){
    let ret = [];
    let count = data.length;
    let Arr = new Array; //原数组 
    //给原数组Arr赋值 
    for (let i = 0; i < count; i++) {
      Arr[i] = i + 1;
    }
    Arr.sort(function () {
      return 0.5 - Math.random();
    });
    for(let i =0;i<num;i++){
        let pictrue = new Pictrue(data[Arr[i]]); 
        ret.push({name: pictrue.title, hint: pictrue.hint,price:pictrue.price,value:pictrue.value});
        // console.log(getelse(ret));
        while(getelse(ret)){
          // console.log(getelse(ret));
          let index=0;
          let newpicutre = new Pictrue(data[Arr[num+index]]);
          ret[ret.length-1] = {name: newpicutre.title, hint: newpicutre.hint,price:newpicutre.price,value:newpicutre.value}
          // console.log(ret);
          index++;
        }
    }
    return ret;
}
function getelse(arr){
  let obj={};
  for(let i=0,len = arr.length;i<len;i++){
    if(obj[arr[i].hint]){
      return true;
    } else{
      obj[arr[i].hint]=true;
    }
  }
  return false;
}
module.exports = getdata;