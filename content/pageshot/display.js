/**
 * 显示大型dataURL图片
 */
// 源网页的tabId
var srcTabId = Number(location.search.substring(1).match(/src=(\d+)/)[1]);

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

setInterval(function(){
    var noteInfo = noteAPI.info();
    if(!noteInfo) return;

    // 向源网页发送重画消息
    chrome.tabs.sendMessage(srcTabId, {
        'command': 'shadowUpdate',
        'data': {
            'noteInfo': noteInfo
        }
    });
}, 2000); // 2秒发送一次
