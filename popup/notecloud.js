/**
 * 供popup层使用的notecloud接口
 */
define(function(){
    // 从google drive端获取页面对象
    var page = function(url, callback){
        chrome.runtime.sendMessage({
            'command': 'page',
            'data': url
        }, function(page){
            callback(page);
        });
    };

    // 将本地修改过的page对象同步到google drive上
    var sync = function(page, callback){
        chrome.runtime.sendMessage({
            'command': 'sync',
            'data': page
        }, function(){
            callback();
        });
    };

    return {
        'page': page,
        'sync': sync
    };
});
