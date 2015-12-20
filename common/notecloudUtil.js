/**
 * 提供便利的的notecloud接口，将通过消息传递机制与notecloud模块进行交互
 * 建议其他层用户使用本模块来调用存储服务，而不是直接发送消息
 *
 * 另外还内置自动同步功能
 *
 * 警告：background层不建议使用本模块，因为在background层使用chrome.runtime.sendMessage的API似乎会导致一些消息发送问题
 */
var notecloudUtil = {
    'page': null,
    'pageshot': null,
    'sync': null
};

// 是否自动同步
var AUTO_SYNC = false;
// 同步时间间隔
var SYNC_INTERVAL = 30000;

// file id 到 interval定时对象的map
var intervalMap = {};
// file id 到 同步状态flag的map
var syncStatusMap = {};

!function(){
    // 从google drive端获取页面对象
    notecloudUtil.page = function(url, callback){
        chrome.runtime.sendMessage({
            'command': 'page',
            'data': url
        }, function(page){
            setupAutpSync(page);
            callback(page);
        });
    };

    // 从google drive端获取截图对象
    notecloudUtil.pageshot = function(url, callback){
        chrome.runtime.sendMessage({
            'command': 'pageshot',
            'data': url
        }, function(pageshot){
            setupAutpSync(pageshot);
            callback(pageshot);
        });
    };

    // 将本地修改过的文件对象(page或pageshot)同步到google drive上
    notecloudUtil.sync =  function(file, callback){
        var id = file.__pageId__ || file.__fileId__;
        console.assert(id);

        if(syncStatusMap[id]){
            console.debug('已经在同步，因此跳过本次同步');
        }else{
            syncStatusMap[id] = true;
            chrome.runtime.sendMessage({
                'command': 'sync',
                'data': file
            }, function(){
                syncStatusMap[id] = false;
                callback();
            });
        }
    };
}();

// 对文件对象设置自动同步
function setupAutpSync(file){
    if(!AUTO_SYNC) return;

    var id = file.__pageId__ || file.__fileId__;
    console.assert(id);

    // 每个file的interval只能设置一次
    if(!intervalMap[id]){
        var interval = setInterval(function(){
            console.debug('自动同步...');
            notecloudUtil.sync(file, function(){
                console.debug('自动同步完成');
            });
        }, SYNC_INTERVAL);

        intervalMap[id] = interval;
    }
}
