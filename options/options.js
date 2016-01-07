//alert("嘿嘿嘿");
//localStorage.removeItem('color');
//document.getElementsByName('color')[0].checked = true;
//alert(document.getElementsByName('color')[0].checked);

/*chrome.runtime.sendMessage({name:"setColor",content:"green"}, function(response){
    document.write(response);
});*/
var color;
chrome.runtime.sendMessage({name:"getColor",content:"green"}, function(response){
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
	chrome.runtime.sendMessage({name:"setColor",content:color}, function(response){
		//document.write(response);
	});
    alert('保存成功:' + "颜色：" + color);
}

