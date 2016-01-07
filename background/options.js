
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
	//设置画笔颜色
    if(message.cmd == 'setColor'){
        localStorage.color = message.content;
		console.debug("现在笔的颜色：" + localStorage.color);
    }
	//获取画笔颜色
	if(message.cmd == 'getColor') {
		//console.debug(localStorage.color);
		sendResponse(localStorage.color || "red");
		
	}
});