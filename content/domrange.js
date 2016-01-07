/*
 * 记录dom范围
 */
// 对外暴露的domRange接口的对象
var domRange = {};

define(function(done){

	var PICK_MAX_COUNT = 100;

	var _DOMSet = {
		_array : [],

		put : function(element){
			if(undefined == element || null == element){
				return;
			}
			if(-1 === this._array.indexOf(element)){
				this._array.push(element);
			}
		},
		pickAll : function(){
			var result = this._array.map(function(e){
				return {
					path : _getPathTo(e),
					text : _getText(e)
				}
			});
			this._array.length = 0;
			return result;
		}
	};

	var _getPathTo = function(element) {
	    if (element.id!=='')
	        return 'id("'+element.id+'")';
	    if (element===document.body)
	        return element.tagName;

	    var ix= 0;
	    var siblings= element.parentNode.childNodes;
	    for (var i= 0; i<siblings.length; i++) {
	        var sibling= siblings[i];
	        if (sibling===element)
	            return _getPathTo(element.parentNode)+'/'+element.tagName+'['+(ix+1)+']';
	        if (sibling.nodeType===1 && sibling.tagName===element.tagName)
	            ix++;
	    }
	};

	var _getText = function(element){
		var tagName = element.tagName;
		var text = "";
		if(tagName == "IMG"){
			text = element.src;
		}else{
			text = element.textContent.replace(/\s/g,"");
		}
		return text;
	};


	// 初始化完成，不调用这个传入的方法会导致后续的模块没有机会初始化
	done();


	var _toRelativePathCoord = function(coord){
		return {
			x : coord[1]-document.body.scrollLeft,
			y : coord[2]-document.body.scrollTop
			};
	};

	var _getRelatedDOMSet = function(path){
		var canvas = $("#notepi-canvas");
		var points = path.getPath();
		var pickCount = Math.min(points.length,PICK_MAX_COUNT);
		var delta = Math.round(points.length/pickCount);
		for(var i=0;i<pickCount;i+=delta){
			var pickPoint = _toRelativePathCoord(points[i]);
			var prevCSS = canvas.css("pointer-events");
			canvas.css("pointer-events","none");
			var pickDOM = document.elementFromPoint(pickPoint.x,pickPoint.y);
			canvas.css("pointer-events",prevCSS);
			_DOMSet.put(pickDOM);
		}
		var set = _DOMSet.pickAll();
		return set;
	};	

	var _compare = function(domSet){
		for(var i in domSet){
			var domInfo = domSet[i];
			var curDOM = document.evaluate(domInfo.path,document).iterateNext();
			if(null == curDOM) return false;
			var curText = _getText(curDOM);
			return domInfo.text === curText;
		}
		return true;
	};

	var _checkAction = function(pathSet){
		var inViewCount = 0;
		var matchCount = 0;
		for(var i=0;i<pathSet.length;i++){
			var path = pathSet[i];
			var domSet = path.context;
			inViewCount++;
			if(_compare(domSet)){
				matchCount++;
			}
		}
		var ratio = (0===inViewCount)?1:matchCount/inViewCount;
		console.info("同步率："+(ratio*100).toFixed(1)+"%.");
		colding = true;
	};

	domRange.getRangeString = function(path){
		return _getRelatedDOMSet(path);
	};	
	
	domRange.check = function(pathSet){
		_checkAction(pathSet);
	};

});
