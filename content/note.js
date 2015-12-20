/*
 * SVG编辑器功能
 */
//设置svg画布
var url= window.location.href;
var width = document.body.scrollWidth;
var height = document.body.scrollHeight;
var $canvas = $("<div id='notepi-canvas'>");

$canvas.height(height);
$canvas.width(width);
$("body").prepend($canvas);

var mousedown = false,lastX, lastY, path, pathString;
var brush=false,eraser=false;
var paper = new Raphael($canvas[0],width,height);
var pathSet = paper.set();

// 使用noteInit函数包装的原因请参考contentScript.js
function noteInit(done){
	//先查看下该页面是否已经有笔记了
	notecloudUtil.page(url, function(response){
		console.debug(response);
		//如果先前已经有笔记，则将以前的饿笔记取出，在画布上重现
		if(typeof response != "undefined"){
			if(typeof response.pathArray != "undefined")
				Array2Set(response.pathArray);
		}

		done();
	});
}

$canvas.mousedown(function (e) {
	mousedown = true;
	if(brush){
		$canvas.addClass("drawing");
	    var x = e.offsetX,
	        y = e.offsetY;

	    pathString = 'M' + x + ' ' + y + 'l0 0';
	    path = paper.path(pathString);
	    lastX = x;
	    lastY = y;
	}
});

$canvas.mouseup(function () {
	mousedown = false;
	if(brush){
		$canvas.removeClass("drawing");
	    pathSet.push(path);
	}
});

$canvas.mousemove(function (e) {
	if (!mousedown || !brush) {
	    return;
	}
	var x = e.offsetX, y = e.offsetY;

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
		  	eraserAction();
		else if(request.cmd == "save") {
			saveAction(sendResponse);
		}
});

//画刷的动作
function brushAction(){
	$canvas.css("pointer-events","auto");
	brush=true;
    eraser=false;
}

//橡皮擦的动作
function eraserAction(){
	$canvas.css("pointer-events","auto");
	eraser=true;
    brush=false;

    pathSet.forEach(function(element){
        element.mouseover(function(){
            if(eraser && mousedown){
                pathSet.exclude(this);
                this.remove();
            }
        });
    });
}

//保存的动作
function saveAction(sendResponse){
	eraser=false;
	brush=false;
	$canvas.css("pointer-events","none");
	var pathArray = Set2Array(pathSet);
	sendResponse({"url":url,"pathArray":pathArray});
}

//将path集合中的路径全都提出来组成数组
function Set2Array(pathSet){
	pathArray=[];
	pathSet.forEach(function(element){
		pathArray.push(element.attr('path'));
	});
	return pathArray;
}

//将含有路径的字符串数组组成path集合,并在画布中显示
function Array2Set(pathArray){
	pathArray.forEach(function (elements){
		pathstring = "";
		elements.forEach(function (element){
			pathstring += element;
		});
		path = paper.path(pathstring);
		pathSet.push(path);
	});
}
