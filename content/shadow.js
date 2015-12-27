/**
 * 将网页上的笔记同步到截图上面的模块
 */
define(function(done){
    // 将当前页面的信息拷贝到截图网页上
    copyToPageshot(true);

    setInterval(function(){
        copyToPageshot();
    }, 2000); // 2秒发送一次

    // 处理从截图网页传来的重画请求
    chrome.runtime.onMessage.addListener(function(msg) {
		if(msg.command === 'shadowUpdate'){
            console.debug('收到重画消息');
            var noteInfo = msg.data.noteInfo;
            // 恢复note
            noteAPI.restore(noteInfo);
        }
	});

    done(); // 初始化完成

    // 将网页上的笔记同步到截图页面上
    // force表示是否强制更新
    function copyToPageshot(force){
        var noteInfo = noteAPI.info(force);
        var pageshotTabId = pageshotAPI.pageshotTabId;
        // 如果没有笔记改变或者没有打开截图页面则跳过
        if(!noteInfo || !pageshotTabId) return;

        // 向截图网页发送重画消息
        chrome.runtime.sendMessage({
            'command': 'shadowUpdate',
            'data': {
                'noteInfo': noteInfo,
                'tabId': pageshotTabId
            }
        });
    }
});
