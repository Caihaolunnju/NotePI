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

	//笔迹存储单元，记录的是一笔的信息
	var PathInfo = {
		createNew : function(){
			var pathInfo = {};
			pathInfo.id=0; //笔迹的ID
			pathInfo.pathArray = []; //笔迹的path中d属性的字符串
			pathInfo.context = ""; //笔迹扫过的上下文
			return pathInfo;
		}
	};

	//传入后台的存储对象SaveData
	var SaveData = {
		creatNew : function(){
			var saveData = {};
			saveData.width = 0;
			saveData.height = 0;
			saveData.pathInfoArray = [];
			return saveData;
		}
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
		},
		check : function(bbox,preRange){
			var prevCSS = canvas.css("pointer-events");
			canvas.css("pointer-events","none");
			var start = document.elementFromPoint(bbox.x,bbox.y);
			var end = document.elementFromPoint(bbox.x2,bbox.y2);
			canvas.css("pointer-events",prevCSS);
			var curRange = document.createRange();
			curRange.setStart(start,0);
			curRange.setEnd(end,0);
			var cur = curRange.toString().replace(/\s/g,"");
			return cur == preRange;
		}
	};

	// 自动同步时间间隔（毫秒）
	// 设置为false则关闭自动同步功能
	var AUTO_SYNC_INTERVAL = 60000;

	//先查看下该页面是否已经有笔记了
	notecloudUtil.page(url, function(response){
		console.debug(response);
		setupAutoSync();

		//如果先前已经有笔记，则将以前的笔记取出，在画布上重现，并且更新idCounter
		if(typeof response != "undefined"){
			if(typeof response.saveData != "undefined"){
				var saveData = response.saveData;
				pathSet = loadingNote(saveData, paper);
				idCounter = getMaxId(saveData);
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
			console.debug("获取range");
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
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if (request.cmd == "brush")
		    toggleBrush();
		else if(request.cmd == "eraser")
		  	toggleEraser(pathSet);
		else if(request.cmd == "buttonStatus")
			buttonStatus(sendResponse);
	});

	// 画刷的切换动作
	// 执行一次开启画刷，再执行则关闭
	function toggleBrush(){
		// 开启画刷
		if(!brush){
			canvas.css("pointer-events","auto");
			brush=true;
		    eraser=false; // 排他性取消橡皮状态
		}
		// 关闭画刷
		else{
			canvas.css("pointer-events","none");
			brush=false;
			saveNote(pathSet); // 关闭时保存
		}
	}

	//橡皮擦的切换动作
	function toggleEraser(pathSet){
		// 开启橡皮擦
		if(!eraser){
			canvas.css("pointer-events","auto");
			eraser=true;
		    brush=false;

			//TODO: 如果反复点击橡皮按钮，会不会导致这里添加多个mouseover回调？
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
		// 关闭橡皮擦
		else{
			canvas.css("pointer-events","none");
			eraser = false;
			saveNote(pathSet);
		}
	}

	//保存的动作
	function saveNote(pathSet){
		console.debug('同步页面数据...');
		var saveData = pkg2SaveData(pathSet);
		notecloudUtil.page(url, function(page){
			page.saveData = saveData;
			notecloudUtil.sync(page,function(){
				notecloudUtil.page(url, function(page){
					console.debug('同步后对象:%s', JSON.stringify(page));
				});
			});
		});
	}

	// 返回当前各按钮的状态
	function buttonStatus(callback){
		var response = {
			'brush': brush,
			'eraser': eraser
		};
		callback(response);
	}

	//将目前画布中的笔迹信息打包放进saveData中
	function pkg2SaveData(pathSet){
		var saveData = SaveData.creatNew();
		saveData.width = document.body.scrollWidth;
		saveData.height = document.body.scrollHeight;
		pathSet.forEach(function(path){
			var pathInfo = PathInfo.createNew();
			pathInfo.pathArray = path.attr('path');
			pathInfo.id = path.id;
			pathInfo.context = path.context;
			console.debug("存入range");
			console.debug(pathInfo.context);
			saveData.pathInfoArray.push(pathInfo);
		});
		return saveData;
	}

	//将之前保存的笔迹在画布中重新显示,返回加载之后的笔迹集合
	function loadingNote(saveData,paper){
		paper.clear();
		var pathSet = paper.set();
		var sameCount = 0;
		for(var i in saveData.pathInfoArray){
			var pathInfo = saveData.pathInfoArray[i];
			pathstring = "";
			pathInfo.pathArray.forEach(function (element){
				pathstring += element;
			});
			var path = paper.path(pathstring);
			path.id = pathInfo.id;
			path.context = pathInfo.context;
			console.debug("取出range");
			console.debug(pathInfo.context);
			var same = domBound.check(path.getBBox(),pathInfo.context);
			sameCount+=same?1:0;
			pathSet.push(path);
		}
		var ratio = sameCount/saveData.length*100;
		console.info("同步率："+ratio+"%.");
		return pathSet;
	}

	//获取之前保存的笔迹中ID最大值，以便之后对新的笔迹进行编号
	function getMaxId(saveData){
		var id = 0;
		saveData.pathInfoArray.forEach(function(pathInfo){
			if(pathInfo.id > id)
				id = pathInfo.id;
		});
		return id;
	}

	// 设置自动同步
	function setupAutoSync(){
		if(!AUTO_SYNC_INTERVAL) return;

		setInterval(function(){
			console.debug('自动同步...');
			saveNote(pathSet);
		}, AUTO_SYNC_INTERVAL);
	}
	
	//设置画笔颜色
	$("path").css("stroke","green");
	//$("#notepi-canvas>svg>path").css("stroke","green");
	//$("#notepi-canvas>svg>path").css("stroke-width","10");
	//alert("xiugaichenggong");

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

	// 添加笔记变化监听函数
	noteAPI.addModifyListener = function(listener){
		modifyListeners.push(listener);
	}
});
