// 默认笔画颜色
localStorage.color = localStorage.color || 'red';
// 默认笔记粗细
localStorage.font = localStorage.font || 5;
// 默认匹配度阈值
localStorage.matchRatio = localStorage.matchRatio || 0.5;

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
	//获取画笔颜色
	if(message.command == 'getColor') {
		sendResponse(localStorage.color);
	}

	//获取画笔粗细
	if(message.command == 'getFont') {
		sendResponse(localStorage.font);
	}

	//获取匹配度阈值
	if(message.command == 'getMatchRatio') {
		sendResponse(localStorage.matchRatio);
	}

    //设置画笔颜色
    if(message.command == 'setColor'){
        localStorage.color = message.content;
        console.debug("笔的颜色设置为：" + localStorage.color);
    }

    //设置画笔粗细
	if(message.command == 'setFont') {
		localStorage.font = message.content;
		console.debug("笔的粗细设置为：" + localStorage.font);
	}

	//设置匹配度阈值
	if(message.command == 'setMatchRatio') {
		localStorage.matchRatio = message.content;
		console.debug("匹配度阈值：" + localStorage.font);
	}
});
