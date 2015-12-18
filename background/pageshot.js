chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse){
    // 截屏
    if(msg.command === 'screenshot'){
        screenshot(function(dataUrl){
            sendResponse(dataUrl);
        });
        return true;
    }

    // 打开dataURL
    if(msg.command === 'openDataURL'){
        var dataURL = msg.data.url;
        chrome.tabs.create({
            'url': chrome.extension.getURL('content/pageshot/display.html')
        }, function(tab){
            // 延时1秒再发送，否则会收不到
            setTimeout(function(){
                chrome.runtime.sendMessage({
                    'command': 'displayDataURL',
                    'data': {
                        'dataURL': dataURL
                    }
                });
            }, 1000);
        });

        return true;
    }
});

function screenshot(callback){
    chrome.tabs.captureVisibleTab(function(dataUrl){
        callback(dataUrl);
    });
}
