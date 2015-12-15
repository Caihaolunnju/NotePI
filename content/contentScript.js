/**
*SVG编辑器功能
*/
//设置svg画布
var url=window.location.href;
var width = document.body.scrollWidth;
var height = document.body.scrollHeight;
var canvas = document.createElement('div');
canvas.setAttribute('style','position:absolute;z-index:999');
canvas.style.pointerEvents="none";
canvas.style.height=height;
canvas.style.width=width;
var first=document.body.firstChild;
document.body.insertBefore(canvas,first);

var mousedown = false,lastX, lastY, path, pathString;
var brush=false,eraser=false;
var paper = new Raphael(canvas,width,height);
var pathSet = paper.set();

$(canvas).mousedown(function (e) {
	mousedown = true;
	if(brush){    
	    var x = e.offsetX,
	        y = e.offsetY;

	    pathString = 'M' + x + ' ' + y + 'l0 0';
	    path = paper.path(pathString);
	    lastX = x;
	    lastY = y;
	}
});

$(canvas).mouseup(function () {
	mousedown = false;
	if(brush){        
	    pathSet.push(path);
	}
});

$(canvas).mousemove(function (e) {
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
		if (request.action == "brush")
		    brushAction();
		else if(request.action == "eraser")
		  	eraserAction();
		else if(request.action == "save") {
			saveAction(sendResponse);
		}
});

//画刷的动作
var brushAction = function(){
	canvas.style.pointerEvents="auto";
	brush=true;
    eraser=false;
};

//橡皮擦的动作
var eraserAction = function(){
	canvas.style.pointerEvents="auto";
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
};

//保存的动作
var saveAction = function(sendResponse){
	eraser=false;
	brush=false;
	canvas.style.pointerEvents="none";
	var pathArray=new Array();
	pathSet.forEach(function(element){
		pathArray.push(element.attr('path'));
	});
	sendResponse({"url":url,"pathArray":pathArray});
};