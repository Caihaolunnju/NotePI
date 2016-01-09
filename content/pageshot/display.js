/**
 * 本模块负责截图显示更新等相关操作
 */

// 一些初始化相关的函数与变量定义在init.js中

// 固定截图尺寸
$('#picDiv').width(pageshotWidth);
$('#picDiv').height(pageshotHeight);

// 特地写一个init方法是因为要保证把图片的位置先撑开，然后note.js才能初始化
// 否则note.js里面会直接获取当前空页面的可视区域作为画板的大小，这是不对的
init();

// 监听截图上笔记的修改事件
noteAPI.addModifyListener(function(){
    var noteInfo = noteAPI.info();
    if(!noteInfo) return;

    // 向源网页发送重画消息
    chrome.tabs.sendMessage(srcTabId, {
        'command': 'shadowUpdate',
        'data': {
            'noteInfo': noteInfo
        }
    });
});

// 消息处理
chrome.runtime.onMessage.addListener(function(msg){
    // 显示
    if(msg.command === 'displayDataURL'){
        var dataURL = msg.data.dataURL;
        var pic = document.getElementById('pic');
        pic.src = dataURL;
    }

    // 重画
    if(msg.command === 'shadowUpdate'){
        console.debug('收到重画消息');
        var noteInfo = msg.data.noteInfo;
        var tabId = msg.data.tabId;
        chrome.tabs.getCurrent(function(tab){
            // 不是发给自己的跳过，因为可能同时有多个截图网页
            if(tab.id !== tabId) return;
            // 恢复note
            noteAPI.restore(noteInfo);
        });
    }
});
