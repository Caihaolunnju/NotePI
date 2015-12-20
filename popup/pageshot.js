/**
 * 网页截图保存测试
 */

!function(){
    // 保存截图按钮监听
    $('#savePageshotBtn').on('click', function(){
        // 向当前页面发送保存网页截图的指令
        chrome.tabs.query({
            'active': true,
            'currentWindow': true
        }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                'command': 'tabSavePageshot'
            });
        });
    });

    // 打开截图按钮监听
    $('#openPageshotBtn').on('click', function(){
        // 向当前页面发送保存网页截图的指令
        chrome.tabs.query({
            'active': true,
            'currentWindow': true
        }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                'command': 'tabOpenPageshot'
            });
        });
    });
}();
