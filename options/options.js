var color;
chrome.runtime.sendMessage({cmd:"getColor",content:"green"}, function(response){
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
	//给background发消息
	chrome.runtime.sendMessage({cmd:"setColor",content:color}, function(response){
		//document.write(response);
	});
	//给contentpage发消息
	chrome.tabs.query({}, function(tabs) {
		for (i in tabs) {
			console.debug("aa");
			chrome.tabs.sendMessage(tabs[i].id, {cmd:"setColor",content:color});
		}
    });
    alert('保存成功:' + "颜色：" + color);
}

