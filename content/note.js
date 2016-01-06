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
			pathInfo.context = []; //笔迹扫过的上下文
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

	// 页面行为函数集合，其他模块可以重写这个集合中的函数以达到重写功能的目的
	var pageAction = {
		'toggleBrush': toggleBrush,
		'toggleEraser': toggleEraser,
		'buttonStatus': buttonStatus,
		'saveNote': saveNote
	};

	// 根据脚本种类进行初始化
	if(!isInternal(url)){
		// 在普通网页里，进行正常的初始化
		webPageInit(function(){
			// 初始化完成，不调用这个传入的方法会导致后续的模块没有机会初始化
			done();
		});
	}else{
		// 在插件内部页面里，进行自定义初始化
		// internalPageInit方法是插件中其他模块中定义的初始化方法，如果有定义则调用
		if((typeof internalPageInit) !== 'undefined') internalPageInit(pageAction);
		done();
	}

	//根据popup发出的消息进行回应
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if (request.cmd == "brush")
		    toggleBrush();
		else if(request.cmd == "eraser")
		  	toggleEraser(pathSet);
		else if(request.cmd == "buttonStatus")
			buttonStatus(sendResponse);
		else if(request.cmd == "saveNote")
			saveNote(pathSet);
	});

	$('body').mousedown(function (e) {
		mousedown = true;
		if(brush){
			canvas.addClass("drawing");
		    var x = e.offsetX,
		        y = e.offsetY;

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
			if(typeof domRange !== 'undefined'){
				var context = domRange.getRangeString(path);
				path.context = context;
			}
			canvas.removeClass("drawing");
		    pathSet.push(path);
		}
	});

	$('body').mousemove(function (e) {
		if (!mousedown || !brush) {
		    return;
		}
		var x = e.offsetX, y = e.offsetY;

		pathString += 'l' + (x - lastX) + ' ' + (y - lastY);
		path.attr('path', pathString);

		lastX = x;
		lastY = y;
	});

	/////////////////////////////////
	/// 以下是各种内部工具函数
	/////////////////////////////////

	// 初始化一个普通的网页
	// 包括读取（可能存在的）页面数据以及自动同步
	function webPageInit(callback){
		//先查看下该页面是否已经有笔记了
		console.debug("检查现有笔记数据...");
		notecloudUtil.page(url, function(response){
			console.debug(response);
			// 设置自动同步
			setupAutoSync();

			//如果先前已经有笔记，则将以前的笔记取出，在画布上重现，并且更新idCounter
			if(typeof response != "undefined" && typeof response.saveData != "undefined"){
					console.debug("发现已有笔记，还原...");
					var saveData = response.saveData;
					pathSet = loadingNote(saveData, paper);
					idCounter = getMaxId(saveData);
			}else{
				console.debug("新建笔记数据");
			}

			callback();
		});
	}

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
			pageAction.saveNote(pathSet); // 关闭时保存,调用的是可重写版本的函数
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
			pageAction.saveNote(pathSet);
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
			pathSet.push(path);
		}
		if(typeof domRange !== 'undefined')
			setTimeout(domRange.check(pathSet),1500);
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
		// 自动同步时间间隔（毫秒）
		// 设置为false则关闭自动同步功能
		// TODO: 这个值应该可以通过插件选项来设置
		var AUTO_SYNC_INTERVAL = 60000;

		if(!AUTO_SYNC_INTERVAL) return;

		setInterval(function(){
			console.debug('自动同步...');
			saveNote(pathSet);
		}, AUTO_SYNC_INTERVAL);
	}

	// 判断给定url是不是插件内部页面
	function isInternal(url){
		if(url.match(/chrome-extension:\/\//)) return true;
		return false;
	}

	//设置画笔颜色
	$("path").css("stroke","green");
	//$("#notepi-canvas>svg>path").css("stroke","green");
	//$("#notepi-canvas>svg>path").css("stroke-width","10");
	//alert("xiugaichenggong");


	/////////////////////////////////
	/// 以下是对外提供的接口
	/////////////////////////////////

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
