/*
 * “画笔”和“橡皮”的功能
 */
!function(){
    refreshButtons();

    // 画笔事件触发
    $('#brush').click(function(){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
           chrome.tabs.sendMessage(tabs[0].id, {command: "brush"});
        });
        refreshButtons();
    });

    // 橡皮事件触发
    $('#eraser').click(function(){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
           chrome.tabs.sendMessage(tabs[0].id, {command: "eraser"});
        });
        refreshButtons();
    });
}();

// 更新各按钮状态
function refreshButtons(){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {command: "buttonStatus"},function(status){
            status.brush ? on('#brush') : off('#brush');
            status.eraser ? on('#eraser') : off('#eraser');
        });
    });
}

function on(selector){
    $(selector).removeClass('disabled');
}

function off(selector){
    $(selector).addClass('disabled');
}
