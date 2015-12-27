/**
 * contentPage初始化代码
 */

// 模块定义的等待序列
var defineQueue = [];
// 定义模块的方法，最主要的目的就是让各个contentPage模块按顺序序列化
function define(mod){
    if(defineQueue.length !== 0) return defineQueue.push(mod);

    // 占位，让后来的请求排队
    defineQueue.push(mod);
    mod(/*done*/ function(){
        // 解除占位
        defineQueue.splice(0,1);
        if(defineQueue.length > 0){
            var nextMod = defineQueue.splice(0,1)[0];
            define(nextMod);
        }
    });
};
