/**
 * 将网页上的笔记同步到截图上面的模块
 */
define(function(done){
    setInterval(function(){
        var noteInfo = noteAPI.info();
        var pageshotTabId = pageshotAPI.pageshotTabId;
        if(!noteInfo || !pageshotTabId) return;

        // 向截图网页发送重画消息
        chrome.runtime.sendMessage({
            'command': 'shadowUpdate',
            'data': {
                'noteInfo': noteInfo,
                'tabId': pageshotTabId
            }
        });
    }, 2000); // 2秒检查一次

    done(); // 初始化完成
});
