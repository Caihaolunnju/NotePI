/*
 * 记录dom范围
 */
// 对外暴露的domRange接口的对象
var domRange = {};

define(function(done){

	var colding = true;
	var COLDINGTIME = 2000;
	var _coldDown = function(){
		colding = false;
	};
	setInterval(_coldDown,COLDINGTIME);

	// 初始化完成，不调用这个传入的方法会导致后续的模块没有机会初始化
	done();

	////////// 以下是对外提供的接口 //////////////

	var _toViewBoundBBox = function(bbox){
		var bbox2 = bbox;
		bbox2.x -= document.body.scrollLeft;
		bbox2.cx -= document.body.scrollLeft;
		bbox2.x2 -= document.body.scrollLeft;
		bbox2.y -= document.body.scrollTop;
		bbox2.cy -= document.body.scrollTop;
		bbox2.y2 -= document.body.scrollTop;
		return bbox2;
	};

	var _outOfView = function(bbox){
		if(bbox.x<0 || bbox.y<0)
			return true;
		else if(bbox.x2 > window.screen.availWidth || bbox.y2 > window.screen.availHeight){
			return true;
		}else{
			return false;
		}
	};

	var _compare = function(bbox,preRange){
		var canvas = $("#notepi-canvas");
		var prevCSS = canvas.css("pointer-events");
		canvas.css("pointer-events","none");
		if(_outOfView(bbox)) return false;
		var start = document.elementFromPoint(bbox.x,bbox.y);
		var end = document.elementFromPoint(bbox.x2,bbox.y2);
		canvas.css("pointer-events",prevCSS);
		var curRange = document.createRange();
		curRange.setStartBefore(start);
		curRange.setEndAfter(end);
		var cur = curRange.toString().replace(/\s/g,"");
		return cur == preRange;
	};

	var _checkAction = function(pathSet){
		var inViewCount = 0;
		var matchCount = 0;
		for(var i=0;i<pathSet.length;i++){
			var path = pathSet[i];
			var bbox = _toViewBoundBBox(path.getBBox());
			if(!_outOfView(bbox)){
				inViewCount++;
				if(_compare(bbox,path.context))
					matchCount++;
			}
		}
		var ratio = (0===inViewCount)?1:matchCount/inViewCount;
		console.info("同步率："+ratio*100+"%.");
		colding = true;
	};

	domRange.getRangeString = function(path){
		var bbox = _toViewBoundBBox(path.getBBox());
		var canvas = $("#notepi-canvas");
		var prevCSS = canvas.css("pointer-events");
		canvas.css("pointer-events","none");
		if(_outOfView(bbox)) return "";
		var start = document.elementFromPoint(bbox.x,bbox.y);
		var end = document.elementFromPoint(bbox.x2,bbox.y2);
		canvas.css("pointer-events",prevCSS);
		var range = document.createRange();
		range.setStartBefore(start);
		range.setEndAfter(end);

		var rangeStirng = range.toString().replace(/\s/g,"");
			
		console.debug("获取range>"+rangeStirng);
		return rangeStirng;
	};	
	
	domRange.check = function(pathSet){
		_checkAction(pathSet);
		$(window).scroll(function(){
        	if(!colding){
        		_checkAction(pathSet);
        	}
        });
	};

});
