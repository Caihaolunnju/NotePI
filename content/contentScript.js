/**
 * contentScript公共部分写这里
 */

// 按顺序初始化各组件，避免各个组件同时初始化导致状态冲突
// 比如同时检查网页要存放目录，发现不存在结果同时新建一个的情况
var initQueue = [];
if(noteInit) initQueue.push(noteInit);
if(pageshotInit) initQueue.push(pageshotInit);

// 这里使用了最简单的实现，可以在以后再修改
if(initQueue.length > 0){
    var func = initQueue.splice(0,1)[0];
    doInit(func);
}
function doInit(func){
    // 执行一个初始化函数
    func(/*done*/function(){
        if(initQueue.length > 0){
            var func = initQueue.splice(0,1)[0];
            doInit(func);
        }
    });
}
