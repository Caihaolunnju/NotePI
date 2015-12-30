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

// file id 到 同步状态flag的map
// 防止同一个file并发同步
var syncStatusMap = {};

!function(){
    /**
     * 从云端获取指定url对应的页面数据
     * @param  {string}   url      url地址
     * @param  {Function} callback callback(page)
     */
    notecloudUtil.page = function(url, callback){
        chrome.runtime.sendMessage({
            'command': 'page',
            'data': url
        }, function(page){
            callback(page);
        });
    };

    /**
     * 从云端获取指定url对应的页面数据
     * @param  {string}   url      url地址
     * @param  {Function} callback callback(page)
     */
    notecloudUtil.pageshot = function(url, callback){
        chrome.runtime.sendMessage({
            'command': 'pageshot',
            'data': url
        }, function(pageshot){
            callback(pageshot);
        });
    };

    /**
     * 将本地的文件对象(page或pageshot)同步到云端
     * @param  {NoteFile}   file   文件对象
     * @param  {Function} callback callback()
     */
    notecloudUtil.sync =  function(file, callback){
        var id = file.__localId__ || file.__fileId__;
        console.assert(id);

        if(syncStatusMap[id]){
            console.debug('已经在同步，跳过本次同步');
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
