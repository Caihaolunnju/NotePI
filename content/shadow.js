/**
 * 将网页上的笔记同步到截图模块
 */
define(function(done){
    var pageshotTabId = null;

    // 处理从截图网页传来的重画请求
    chrome.runtime.onMessage.addListener(function(msg) {
        // 截图网页创建完成
        if(msg.command === 'pageshotCreated'){
            // 记录下截图网页的tabId，发消息的时候要用
            pageshotTabId = msg.data.pageshotTabId;
            // 将当前笔记同步到截图页面上去
            copyToPageshot();
        }
		if(msg.command === 'shadowUpdate'){
            console.debug('收到重画消息');
            var noteInfo = msg.data.noteInfo;
            // 恢复note
            noteAPI.restore(noteInfo);
        }
	});

    // 监听笔记修改
    noteAPI.addModifyListener(function(){
        copyToPageshot();
    });

    done(); // 初始化完成

    function copyToPageshot(){
        var noteInfo = noteAPI.info();
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
