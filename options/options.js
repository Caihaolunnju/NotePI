//alert("�ٺٺ�");
//localStorage.removeItem('color');
//document.getElementsByName('color')[0].checked = true;
//alert(document.getElementsByName('color')[0].checked);

//����ѡ��еĻ�����ɫ
var color = localStorage.color || 0;
if(color == 0) {
	document.getElementsByName('color')[0].checked = true;
} else if(color == 1) {
	document.getElementsByName('color')[1].checked = true;
} else if(color == 2) {
	document.getElementsByName('color')[2].checked = true;
} else if(color == 3) {
	document.getElementsByName('color')[3].checked = true;
}


//������水ť
document.getElementById('save').onclick = function(){
	//���滭����ɫ
	if(document.getElementsByName('color')[0].checked) {
		localStorage.color = 0;
	} else if(document.getElementsByName('color')[1].checked) {
		localStorage.color = 1;
	} else if(document.getElementsByName('color')[2].checked) {
		localStorage.color = 2;
	} else if(document.getElementsByName('color')[3].checked) {
		localStorage.color = 3;
	}
	
	
    alert('����ɹ�:' + "��ɫ��" + localStorage.color);
}


var city = localStorage.city || 'beijing';
document.getElementById('city').value = city;
document.getElementById('save').onclick = function(){
    localStorage.city = document.getElementById('city').value;
    alert('����ɹ���');
}