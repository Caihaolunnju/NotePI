//alert("嘿嘿嘿");
//localStorage.removeItem('color');
//document.getElementsByName('color')[0].checked = true;
//alert(document.getElementsByName('color')[0].checked);

//处理选项卡中的画笔颜色
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


//点击保存按钮
document.getElementById('save').onclick = function(){
	//保存画笔颜色
	if(document.getElementsByName('color')[0].checked) {
		localStorage.color = 0;
	} else if(document.getElementsByName('color')[1].checked) {
		localStorage.color = 1;
	} else if(document.getElementsByName('color')[2].checked) {
		localStorage.color = 2;
	} else if(document.getElementsByName('color')[3].checked) {
		localStorage.color = 3;
	}
	
	
    alert('保存成功:' + "颜色：" + localStorage.color);
}


var city = localStorage.city || 'beijing';
document.getElementById('city').value = city;
document.getElementById('save').onclick = function(){
    localStorage.city = document.getElementById('city').value;
    alert('保存成功。');
}