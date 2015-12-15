/**
 * page对象
 */

define(function(){
    var Page = function(pageData){
        // 如果传入的已经是Page对象，那么就直接返回本身
        if(pageData && pageData.constructor.toString().match(/Page/)){
            return pageData;
        }

        // 云端关联的文件Id
        this.__fileId__ = undefined;
        // 本地关联的id，这两个同时只会有一个有值
        this.__pageId__ = undefined;
        this.__isSyncing__ = false;

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

    Page.prototype.__autoSync__ = function(sync, interval){
        // 对间隔时间有限制
        if(!interval || isNaN(interval) || interval < 15000) return;

        var self = this;
        setInterval(function(){
            if(self.__isSyncing__) return;
            self.__isSyncing__ = true;

            sync(self, function(err){
                self.__isSyncing__ = false;

                if(err) return console.error(err);
                console.debug("已自动同步");
            });
        }, interval);
    };

    return Page;
});
