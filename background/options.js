// 设置默认颜色与粗细
localStorage.color = localStorage.color || 'red';
localStorage.font = localStorage.font || 5;

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
	//获取画笔颜色
	if(message.cmd == 'getColor') {
		sendResponse(localStorage.color);
	}

	//获取画笔粗细
	if(message.cmd == 'getFont') {
		sendResponse(localStorage.font);
	}

    //设置画笔颜色
    if(message.cmd == 'setColor'){
        localStorage.color = message.content;
        console.debug("现在笔的颜色：" + localStorage.color);
    }

    //设置画笔粗细
	if(message.cmd == 'setFont') {
		localStorage.font = message.content;
		console.debug("现在笔的粗细：" + localStorage.font);
	}
});
