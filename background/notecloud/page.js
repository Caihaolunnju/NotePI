/**
 * page对象
 */

define(function(){
    var Page = function(pageData){
        // 关联的fileId
        this.__fileId__ = undefined;

        // 如果有传入数据（且不是Page对象），那么就用这个数据来构建Page对象
        if(pageData && !pageData.constructor.toString().match(/Page/)){
            for(var key in pageData){
                this[key] = pageData[key];
            }
        }
    };

    // 将另一个page对象合并到自己身上
    // 别人有自己没有则加上，否则忽略
    Page.prototype.__merge__ = function(other){
        for(var key in other){
            if(!other.hasOwnProperty(key) // 继承属性
                || key.indexOf('__') >= 0 // 忽略元属性
                || this[key] !== undefined) // 自己有的属性
                    continue;

            this[key] = other[key];
        }
    };

    return Page;
});
