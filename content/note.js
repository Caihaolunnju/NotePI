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
	var color;
	var font;

	//笔迹存储单元，记录的是一笔的信息
	var PathInfo = {
		createNew : function(){
			var pathInfo = {};
			pathInfo.id=0; //笔迹的ID
			pathInfo.pathArray = []; //笔迹的path中d属性的字符串
			pathInfo.context = ""; //笔迹扫过的上下文
			pathInfo.color = "red"; //笔记的颜色
			pathInfo.font = 5; //笔记的粗细
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
			//向background请求color和font
			chrome.runtime.sendMessage({command:"getColor"}, function(response){
				color = response;
			});
			chrome.runtime.sendMessage({command:"getFont"}, function(response){
				font = response;
			});
			// 初始化完成，不调用这个传入的方法会导致后续的模块没有机会初始化
			done();
		});
	}else{
		// 在插件内部页面里，进行自定义初始化
		// internalPageInit方法是插件中其他模块中定义的初始化方法，如果有定义则调用
		if((typeof internalPageInit) !== 'undefined')
			internalPageInit(pageAction);

		// 内部页面无法使用消息机制来获得笔记颜色和粗细信息
		// 直接访问localStorage获取
		color = localStorage.color;
		font = localStorage.font;

		// 初始化完成
		done();
	}

	//根据popup发出的消息进行回应
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if (request.command == "brush")
		    toggleBrush();
		else if(request.command == "eraser")
		  	toggleEraser(pathSet);
		else if(request.command == "buttonStatus")
			buttonStatus(sendResponse);
		else if(request.command == "saveNote")
			saveNote(pathSet);
		else if(request.command == 'setColor') {
			color = request.content;
			console.debug("颜色变为：" + color);
		}
		else if(request.command == 'setFont') {
			font = request.content;
			console.debug("粗细变为：" + font);
		}
	});

	$('body').mousedown(function (e) {
		console.debug("当前颜色：" + color);

		mousedown = true;
		if(brush){
			canvas.addClass("drawing");
		    var x = e.offsetX,
		        y = e.offsetY;

		    pathString = 'M' + x + ' ' + y + 'l0 0';
		    path = paper.path(pathString);
			path.attr('stroke',color);
			path.attr("stroke-width",font);
		    idCounter++;
		    path.id = idCounter;
			path.color = color;
			path.font = font;
		    lastX = x;
		    lastY = y;
		}
	});

	$('body').mouseup(function () {
		mousedown = false;
		if(brush){
			if(typeof domRange !== 'undefined'){
				var context = domRange.getContext(path);
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
					// 不管匹配度都还原笔记
					pathSet = loadingNote(saveData, paper);
					idCounter = getMaxId(saveData);

					// 页面匹配度检查
					checkAPI.checkPage(saveData, pathSet, function(checkData){
						// 匹配度没到匹配度阈值，显示截图
						if(!checkData.matches){
							console.debug('匹配度过低[匹配度'+checkData.ratio+']，准备显示截图...');
							pageshotAPI.openPageshot();
						}else{
							console.debug('通过匹配度检查[匹配度'+checkData.ratio+']，不显示截图');
						}
					});
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
			//查了一下，网上说是原生的js绑多了，会留最后一个，jQuery是帮多少就执行多少
			//所以我觉得这个应该是属于原生的js
			for(i in pathSet){
		        pathSet[i].mouseover(function(){
		            if(eraser && mousedown){
		            	//获取擦除的笔迹的ID
		            	if(this.id != null)
		            		console.debug(this.id);
		                pathSet.exclude(this);
		                this.remove();
		            }
		        });
		    }
		}
		// 关闭橡皮擦
		else{
			canvas.css("pointer-events","none");
			eraser = false;
			pageAction.saveNote(pathSet);
		}
	}

	// 页面默认保存的行为
	function saveNote(pathSet){
		console.debug('同步页面数据...');
		var saveData = pkg2SaveData(pathSet);
		notecloudUtil.page(url, function(page){
			page.saveData = saveData;
			notecloudUtil.sync(page,function(){
				// 数据同步完成后也顺便保存一下截图数据
				console.debug('同步页面截图...');
				pageshotAPI.savePageshot();

				// 同步完成后重新取出同步完的对象
				// 只是测试使用，没有实际的生产意义
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
		for(var i=0; i<pathSet.length; i++){
			var path = pathSet[i];
			var pathInfo = PathInfo.createNew();
			pathInfo.pathArray = path.attr('path');
			pathInfo.id = path.id;
			pathInfo.context = path.context;
			pathInfo.color = path.color;
			pathInfo.font = path.font;
			saveData.pathInfoArray.push(pathInfo);
		}
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
			for(i in pathInfo.pathArray){
				var array = pathInfo.pathArray[i];
				pathstring +=  array;
				pathstring += " ";
			}
			path = paper.path(pathstring).attr('stroke',pathInfo.color).attr("stroke-width",pathInfo.font);
			path.color = pathInfo.color;
			path.id = pathInfo.id;
			path.font = pathInfo.font;
			path.context = pathInfo.context;
			//path.attr({'fill':'#999','stroke-opacity' : 0, 'opacity':0.5});
			pathSet.push(path);
		}
		return pathSet;
	}

	//获取之前保存的笔迹中ID最大值，以便之后对新的笔迹进行编号
	function getMaxId(saveData){
		var id = 0;
		for(i in saveData.pathInfoArray){
			if(saveData.pathInfoArray[i].id > id){
				id = saveData.pathInfoArray[i].id;
			}
		}
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
