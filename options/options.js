var color;
var font;
chrome.runtime.sendMessage({cmd:"getColor"}, function(response){
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

chrome.runtime.sendMessage({cmd:"getFont"}, function(response){
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
	//给background发消息
	chrome.runtime.sendMessage({cmd:"setColor",content:color}, function(response){
		//document.write(response);
	});
	chrome.runtime.sendMessage({cmd:"setFont",content:font}, function(response){
		//document.write(response);
	});
	//给contentpage发消息
	chrome.tabs.query({}, function(tabs) {
		for (i in tabs) {
			//console.debug("aa");
			chrome.tabs.sendMessage(tabs[i].id, {cmd:"setColor",content:color});
			chrome.tabs.sendMessage(tabs[i].id, {cmd:"setFont",content:font});
		}
    });
    alert('保存成功:' + "颜色：" + color + "粗细：" + font);
    window.close();
}
