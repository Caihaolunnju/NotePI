var color;
var font;
var matchRatio;
chrome.runtime.sendMessage({command:"getColor"}, function(response){
    color = response;
	//处理选项卡中的画笔颜色
	if(color == "red") {
		document.getElementsByName('color')[0].checked = true;
	} else if(color == "black") {
		document.getElementsByName('color')[1].checked = true;
	} else if(color == "blue") {
		document.getElementsByName('color')[2].checked = true;
	} else if(color == "white") {
		document.getElementsByName('color')[3].checked = true;
	} else if(color == "green") {
		document.getElementsByName('color')[4].checked = true;
	}

});

chrome.runtime.sendMessage({command:"getFont"}, function(response){
    font = response;
	//处理选项卡中的画笔粗细
	if(font == 1) {
		document.getElementsByName('font')[0].checked = true;
	} else if(font == 3) {
		document.getElementsByName('font')[1].checked = true;
	} else if(font == 5) {
		document.getElementsByName('font')[2].checked = true;
	} else if(font == 10) {
		document.getElementsByName('font')[3].checked = true;
	}
});

chrome.runtime.sendMessage({command:"getMatchRatio"}, function(response){
    matchRatio = response;
	//处理选项卡中的匹配度阈值
	if(matchRatio == 0.3) {
		document.getElementsByName('match')[0].checked = true;
	} else if(matchRatio == 0.5) {
		document.getElementsByName('match')[1].checked = true;
	} else if(matchRatio == 0.8) {
		document.getElementsByName('match')[2].checked = true;
	} else if(matchRatio == 1) {
		document.getElementsByName('match')[3].checked = true;
	}
});

//点击保存按钮
document.getElementById('save').onclick = function(){
	//保存画笔颜色
	if(document.getElementsByName('color')[0].checked) {
		color = "red";
	} else if(document.getElementsByName('color')[1].checked) {
		color = "black";
	} else if(document.getElementsByName('color')[2].checked) {
		color = "blue";
	} else if(document.getElementsByName('color')[3].checked) {
		color = "white";
	} else if(document.getElementsByName('color')[4].checked) {
		color = "green";
	}
	//保存画笔粗细
	if(document.getElementsByName('font')[0].checked) {
		font = 1;
	} else if(document.getElementsByName('font')[1].checked) {
		font = 3;
	} else if(document.getElementsByName('font')[2].checked) {
		font = 5;
	} else if(document.getElementsByName('font')[3].checked) {
		font = 10;
	}
	//保存匹配度阈值
	if(document.getElementsByName('match')[0].checked) {
		matchRatio = 0.3;
	} else if(document.getElementsByName('match')[1].checked) {
		matchRatio = 0.5;
	} else if(document.getElementsByName('match')[2].checked) {
		matchRatio = 0.8;
	} else if(document.getElementsByName('match')[3].checked) {
		matchRatio = 1;
	}
	//给background发消息
	chrome.runtime.sendMessage({command:"setColor",content:color}, function(response){
		//document.write(response);
	});
	chrome.runtime.sendMessage({command:"setFont",content:font}, function(response){
		//document.write(response);
	});
	chrome.runtime.sendMessage({command:"setMatchRatio",content:matchRatio}, function(response){
		//document.write(response);
	});
	//给contentpage发消息
	chrome.tabs.query({}, function(tabs) {
		for (i in tabs) {
			//console.debug("aa");
			chrome.tabs.sendMessage(tabs[i].id, {command:"setColor",content:color});
			chrome.tabs.sendMessage(tabs[i].id, {command:"setFont",content:font});
		}
    });
    alert('保存成功:' + "颜色：" + color + "粗细：" + font);
    window.close();
}
