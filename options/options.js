var color;
chrome.runtime.sendMessage({cmd:"getColor",content:"green"}, function(response){
    color = response;
	//����ѡ��еĻ�����ɫ
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



//������水ť
document.getElementById('save').onclick = function(){
	//���滭����ɫ
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
	//��background����Ϣ
	chrome.runtime.sendMessage({cmd:"setColor",content:color}, function(response){
		//document.write(response);
	});
	//��contentpage����Ϣ
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {cmd:"setColor",content:color});
    });
    alert('����ɹ�:' + "��ɫ��" + color);
}

