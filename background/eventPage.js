require.config({
    baseUrl:'background',
    paths: {
        'cloud': 'notecloud/cloud'
　　}
});

requirejs(['cloud'], function(cloud){
    registerCloud(cloud);
});

// 注册云存储消息监听
function registerCloud(cloud){
    // 监听page消息
    chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse){
        // 这里只处理page与sync请求
        if(msg.command !== 'page' && msg.command !== 'sync') return;

        chrome.identity.getAuthToken({'interactive': true}, function(token){
            // 设置token，用于后续的访问
            cloud.gdtoken(token);

            // page请求
            if(msg.command === 'page'){
                var url = msg.data;
                // 获取page对象
                cloud.page(url, function(err, page){
                    // chrome的响应消息只能发出一个对象，因此这里error就简单地输出
                    if(err) return console.error(err);
                    sendResponse(page);
                });
            }

            // sync请求
            if(msg.command === 'sync'){
                var page = msg.data;
                // 获取page对象
                cloud.sync(page, function(err){
                    // chrome的响应消息只能发出一个对象，因此这里error就简单地输出
                    if(err) return console.error(err);
                    sendResponse();
                });
            }
        });

        // 保持sendResponse有效
        return true;
    });
}
