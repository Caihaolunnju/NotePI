
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
	//���û�����ɫ
    if(message.name == 'setColor'){
        localStorage.color = message.content;
		console.debug("���ڱʵ���ɫ��" + localStorage.color);
    }
	//��ȡ������ɫ
	if(message.name == 'getColor') {
		sendResponse(localStorage.color || "red");
	}
});