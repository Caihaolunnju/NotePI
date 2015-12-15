require.config({
    paths: {
        'cloud': 'notecloud/cloud'
　　}
});

define(['cloud'], function(cloud){
    var setup = function(){
        // 这里设置了本地模拟模式，数据将全部存储在本地的chrome.storage.local上面，方便开发
        // 但是要注意的是，本地存储上限只有5MB，请谨慎使用
        cloud.configuration({
            local: true, // 将这句话注掉就变成了正常模式，将与Google Drive交互，容量『理论上』不受限制
            autoSyncInterval: 5000 // 这里设置了自动同步的时间间隔
        });
        registerCloud(cloud);
    };

    return {
        'setup': setup
    };
});

// 注册云存储消息监听
function registerCloud(cloud){
    // 监听page消息
    chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse){
        // page请求
        if(msg.command === 'page'){
            var url = msg.data;
            // 获取page对象
            cloud.page(url, function(err, page){
                // chrome的响应消息只能发出一个对象，因此这里error就简单地输出
                if(err) return console.error(err);
                sendResponse(page);
                console.debug("消息已回送");
            });

            // 保持sendResponse有效
            return true;
        }

        // sync请求
        if(msg.command === 'sync'){
            var page = msg.data;
            // 获取page对象
            cloud.sync(page, function(err){
                // chrome的响应消息只能发出一个对象，因此这里error就简单地输出
                if(err) return console.error(err);
                sendResponse();
                console.debug("消息已回送");
            });
            return true;
        }
    });
}
