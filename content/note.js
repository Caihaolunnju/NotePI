/*
 * SVG编辑器功能
 */
// 对外暴露的note功能接口的对象
var noteAPI = {};

define(function(done){
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
		pathArray : [],	//笔迹的path中d属性的字符串
		context : "" //笔迹扫过的上下文
	};

	//笔记扫过的dom
	var domBound = {
		_minX : undefined,
		_minY : undefined,
		_maxX : undefined,
		_maxY : undefined,

		addPoint : function(x,y){
			if(this._minX==undefined || x<this._minX)this._minX=x;
			if(this._minY==undefined || y<this._minY)this._minY=y;
			if(this._maxX==undefined || x>this._maxX)this._maxX=x;
			if(this._maxY==undefined || y>this._maxY)this._maxY=y;
		},
		clear : function(){
			this._minX = undefined;
			this._minY = undefined;
			this._maxX = undefined;
			this._maxY = undefined;
		},
		getDomRange : function(){
			var prevCSS = canvas.css("pointer-events");
			canvas.css("pointer-events","none");
			var start = document.elementFromPoint(this._minX,this._minY);
			var end = document.elementFromPoint(this._maxX,this._maxY);
			canvas.css("pointer-events",prevCSS);
			var range = document.createRange();
			range.setStart(start,0);
			range.setEnd(end,0);
			return range;
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

		// 初始化完成，不调用这个传入的方法会导致后续的模块没有机会初始化
		done();
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
			var context = domBound.getDomRange().toString().replace(/\s/g,"");
			console.debug(context);
			path.context = context;
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
			pathInfo.context = path.context;
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

	////////// 以下是对外提供的接口 //////////////

	var modifyListeners = [];
	$('body').mouseup(function (e) {
		// 依次调用各个监听者
		modifyListeners.forEach(function(listener){
			listener();
		});
	});

	// 返回当前笔记的所有打包数据
	noteAPI.info = function(force){
		return pkg2SaveData(pathSet);
	};

	// 使用打包数据重画所有笔记
	noteAPI.restore = function(noteInfo){
		pathSet = loadingNote(noteInfo, paper);
		idCounter = getMaxId(noteInfo);
	}

	noteAPI.addModifyListener = function(listener){
		modifyListeners.push(listener);
	}
});
