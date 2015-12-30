/*
 * “画笔”和“橡皮”的功能
 */
!function(){
    refreshButtons();

    $('#brush').click(function(){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
           chrome.tabs.sendMessage(tabs[0].id, {cmd: "brush"});
        });
        refreshButtons();
    });

    $('#eraser').click(function(){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
           chrome.tabs.sendMessage(tabs[0].id, {cmd: "eraser"});
        });
        refreshButtons();
    });

    $('#save').click(function(){
        chrome.tabs.query({active: true, currentWindow: true},function(tabs) {
           chrome.tabs.sendMessage(tabs[0].id, {cmd: "save"});
        });
        refreshButtons();
    });
}();

// 更新各按钮状态
function refreshButtons(){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {cmd: "buttonStatus"},function(status){
            status.brush ? on('#brush') : off('#brush');
            status.eraser ? on('#eraser') : off('#eraser');
        });
    });
}

function on(selector){
    $(selector).text($(selector).data('on'));
}

function off(selector){
    $(selector).text($(selector).data('off'));
}
