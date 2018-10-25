class Picture {
    constructor({title, hint}){
        this.title = title;
        this.hint = hint;
        this.generateprice(); //生成价格
        this.generatevalue(); //生成价值
    }
    generateprice(){
        this.price = 700;
    }
    generatevalue(){
        if(!this.price){
            throw new Error('图画价值生成错误');
        } else{
            this.value = Math.floor((Math.random()*(3000-this.price)+this.price)/100)*100; 
        }
    }
}
module.exports = Picture;