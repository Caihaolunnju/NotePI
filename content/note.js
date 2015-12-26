/*
 * SVG编辑器功能
 */
//设置svg画布
var url= window.location.href;
var width = document.body.scrollWidth;
var height = document.body.scrollHeight;
var canvas = $("<div id='notepi-canvas' >");
$("body").prepend(canvas);

var paper = new Raphael(canvas[0],width,height);
var pathSet = paper.set();

var mousedown = false,lastX, lastY, path, pathString;
var brush=false,eraser=false;
var idCounter=0; //对path元素ID进行编号的计数器

//存储单元，记录的是一笔的信息
var pathInfo = {
	id : 0,	//笔迹的ID
	pathArray : []	//笔迹的path中d属性的字符串
};

//笔记扫过的dom
var domBound = {
	_array : [],

	addPoint : function(x,y){
		var dom = document.elementFromPoint(x,y);
		if(-1 == this._array.indexOf(dom)){
			this._array.push(dom);
		}
	},
	clear : function(){
		this._array.length = 0;
	}
};

//先查看下该页面是否已经有笔记了
notecloudUtil.page(url, function(response){
	console.debug(response);
	//如果先前已经有笔记，则将以前的笔记取出，在画布上重现，并且更新idCounter
	if(typeof response != "undefined"){
		if(typeof response.saveData != "undefined"){
			pathSet = loadingNote(response.saveData, paper);
			idCounter = getMaxId(response.saveData);
		}
	}
});

$('body').mousedown(function (e) {
	mousedown = true;
	if(brush){
		canvas.addClass("drawing");
	    var x = e.offsetX,
	        y = e.offsetY;

	    domBound.addPoint(e.clientX,e.clientY);

	    pathString = 'M' + x + ' ' + y + 'l0 0';
	    path = paper.path(pathString);
	    idCounter++;
	    path.id = idCounter;
	    lastX = x;
	    lastY = y;
	}
});

$('body').mouseup(function () {
	mousedown = false;
	if(brush){
		console.debug(domBound._array);
		domBound.clear();

		canvas.removeClass("drawing");
	    pathSet.push(path); 
	}
});

$('body').mousemove(function (e) {
	if (!mousedown || !brush) {
	    return;
	}
	var x = e.offsetX, y = e.offsetY;

	domBound.addPoint(e.clientX,e.clientY);

	pathString += 'l' + (x - lastX) + ' ' + (y - lastY);
	path.attr('path', pathString);

	lastX = x;
	lastY = y;
});

//根据popup发出的消息进行回应
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.cmd == "brush")
		    brushAction();
		else if(request.cmd == "eraser")
		  	eraserAction(pathSet);
		else if(request.cmd == "save") {
			saveAction(sendResponse,pathSet);
		}
});

//画刷的动作
function brushAction(){
	canvas.css("pointer-events","auto");
	brush=true;
    eraser=false;
}

//橡皮擦的动作
function eraserAction(pathSet){
	canvas.css("pointer-events","auto");
	eraser=true;
    brush=false;

    pathSet.forEach(function(element){
        element.mouseover(function(){
            if(eraser && mousedown){
            	//获取擦除的笔迹的ID
            	if(this.id != null)
            		console.debug(this.id);
                pathSet.exclude(this);
                this.remove();
            }
        });
    });
}

//保存的动作
function saveAction(sendResponse, pathSet){
	eraser=false;
	brush=false;
	canvas.css("pointer-events","none");
	sendResponse({"url":url,"saveData":pkg2SaveData(pathSet)});
}

//将目前画布中的笔迹信息打包放进saveData中
function pkg2SaveData(pathSet){
	var saveData = [];
	pathSet.forEach(function(path){
		var pathInfo = {};
		pathInfo.pathArray = path.attr('path');
		pathInfo.id = path.id;
		saveData.push(pathInfo);
	});
	return saveData;
}

//将之前保存的笔迹在画布中重新显示,返回加载之后的笔迹集合
function loadingNote(saveData,paper){
	var pathSet = paper.set();
	saveData.forEach(function (pathInfo){
		pathstring = "";
		pathInfo.pathArray.forEach(function (element){
			pathstring += element;
		});
		var path = paper.path(pathstring);
		path.id = pathInfo.id;
		pathSet.push(path);
	});
	return pathSet;
}

//获取之前保存的笔迹中ID最大值，以便之后对新的笔迹进行编号
function getMaxId(saveData){
	var id = 0;
	saveData.forEach(function(pathInfo){
		if(pathInfo.id > id)
			id = pathInfo.id;
	});
	return id;
}