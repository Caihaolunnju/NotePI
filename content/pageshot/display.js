/**
 * 显示大型dataURL图片
 */
chrome.runtime.onMessage.addListener(function(msg){
    console.debug('on msg');
    if(msg.command === 'displayDataURL'){
        var dataURL = msg.data.dataURL;
        var pic = document.getElementById('pic');
        pic.src = dataURL;
    }

    if(msg.command === 'shadowUpdate'){
        var noteInfo = msg.data.noteInfo;
        var tabId = msg.data.tabId;
        chrome.tabs.getCurrent(function(tab){
            // 不是发给自己的，因为可能同时有多个截图网页
            if(tab.id !== tabId) return;

            noteAPI.restore(noteInfo);
        });
    }
});
