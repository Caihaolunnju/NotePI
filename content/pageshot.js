/**
 * 截图功能模块
 */
define(function(done){
    // 绘制整个网页截图使用的canvas
    var pageCanvas = document.createElement('canvas');
    pageCanvas.height = $(document).height();
    pageCanvas.width = $(document).width();
    var pageCtx = pageCanvas.getContext('2d');

    // 临时画布，防止临时canvas被回收而设置在这里的全局变量
    var tmpCanvas;

    // 存放所有span的数组
    var spans = [];

    var begins = false; // 截图开始flag
    var cooling = false; // 冷却时间，防止快速滚动的时候频繁截图
    var coolTimeout = null; // 冷却机制使用的timeout对象

    var FIRST_SCREENSHOT_TIME = 4000; // 页面加载后触发第一次截屏的等待时间
    var SCREENSHOT_INTERVAL = 2000; // 每次截屏的时间间隔

    // 自动同步时间间隔（毫秒）
	// 设置为false则关闭自动同步功能
	var AUTO_SYNC_INTERVAL = 120000;

    // 本页面的url
    var currentURL = window.location.href;

    // 截图文件对象
    var pageshot = null;

    // 获取上一次截图的信息，如果有则打开截图
    notecloudUtil.pageshot(currentURL, function(ps){
        pageshot = ps;
        setupAutoSync();

        // 如果有数据，则打开
        if(pageshot.data){
            console.debug('存在上次保存的截图，正在获取...')
            openPageshot(pageshot.data);
        }

        // 来自popup的pageshot相关消息处理
        // 只有在获取了上次截图信息后才允许保存或打开截图
        chrome.runtime.onMessage.addListener(function(msg){
            if(msg.command === 'tabSavePageshot'){
                console.debug("保存截图...");
                tabSavePageshot();
            }
        });

        done();
    });

    // 网页滚动事件监听
    $(window).scroll(function(){
        if(begins && !cooling){
            cooling = true;
            countingDown();
        }else if(begins && cooling){
            // 如果在冷却时间又发生了滚动事件则重新倒计时
            clearTimeout(coolTimeout);
            countingDown();
        }

        function countingDown(){
            coolTimeout = setTimeout(function(){
                cooling = false;
                validScroll();
            }, SCREENSHOT_INTERVAL);
        }
    });

    // 先行触发一次
    setTimeout(function(){
        begins = true;
        validScroll();
    }, FIRST_SCREENSHOT_TIME);

    // 标签页保存整个网页截图操作
    function tabSavePageshot(){
        // 上一次截图的数据
        var lastDataURL = pageshot.data;
        // 这一次的截图数据
        var currentDataURL = pageCanvas.toDataURL();
        // 合并两次截图数据
        mergePageshot(lastDataURL, currentDataURL, function(dataURL){
            // 使用合并后新的截图数据并同步
            pageshot.data = dataURL;

            notecloudUtil.sync(pageshot, function(){
                console.debug('截图同步完成');
            });
        });
    }

    // 打开截图页面
    function openPageshot(url){
        pageshotUtil.openPageshot(url);
    }

    // 合并两张截图数据，返回合并后的截图的dataURL
    function mergePageshot(lastDataURL, currentDataURL, callback){
        // 如果原来没有数据，那么就直接返回当前的值，没什么好合并的了
        if(!lastDataURL) return callback(currentDataURL);

        // 临时canvas,和pageCanvas一样大
        var tmpCanvas = document.createElement('canvas');
        tmpCanvas.height = pageCanvas.height;
        tmpCanvas.width = pageCanvas.width;
        var ctx = tmpCanvas.getContext('2d');

        // 临时image
        var image = new Image();
        image.onload = function(){
            ctx.drawImage(image, 0, 0);
            // 当前图片的src已经是currentDataURL了，说明两张图都画完了，返回
            if(image.src === currentDataURL){
                return callback(tmpCanvas.toDataURL());
            }
            image.src = currentDataURL;
        };
        image.src = lastDataURL;
    }

    // 设置自动同步
    function setupAutoSync(){
        if(!AUTO_SYNC_INTERVAL) return;

        setInterval(function(){
			console.debug('网页截图自动同步...');
			tabSavePageshot();
		}, AUTO_SYNC_INTERVAL);
    }

    // 有效的滚动操作触发
    function validScroll(){
        var pageOffset = $(document).scrollTop();
        var visibleHeight = $(window).height();
        scroll(pageOffset, pageOffset + visibleHeight);
    }

    // 滚动后触发的处理函数
    // x1,x2为可视区域的上下坐标
    function scroll(x1, x2){
        console.assert(x1 <= x2);

        for(var i=0; i<spans.length; i++){
            if( spans[i].contains(x1) ){
                // 如果x1,x2在同一个span里面，那就没什么新的了，直接跳过
                if( spans[i].contains(x2) ) return;

                for(var j=i+1; j<spans.length; j++){
                    // 如果两个端点分属两个span，前一个合并后一个
                    if( spans[j].contains(x2) ){
                        var diff = spans[i].merge(spans[j]);
                        spans.splice(j, 1); // 在j位置删掉一个元素

                        if(!diff) continue;
                        return emitNewSpan(x1, x2, diff);
                    }
                }

                // 如果x1在一个span里但是x2不在，那就把这个span延伸到x2处
                var diff = spans[i].extend(x2);

                if(!diff) continue;
                return emitNewSpan(x1, x2, diff);
            }

            // 如果没能包含x1但是有span包含了x2，则将这个span向前延伸到x1处
            if( spans[i].contains(x2) ){
                var diff = spans[i].extend(x1);
                if(!diff) continue;
                return emitNewSpan(x1, x2, diff);
            }
        }

        if( x1 < x2 ){
            // 这是一个全新的span
            var span = new Span(x1, x2);
            spans.push(span);
            emitNewSpan(x1, x2, span);
        }

        // 否则什么也不做
    }

    // 如果有新的span则触发
    // x1,x2为可视区域的上下坐标，span为新的span区域
    function emitNewSpan(x1, x2, span){
        console.assert( x1 <= span.start && span.end <= x2);

        screenshot(function(url){
            var image = new Image();
            image.onload = function() {
                var sx = 0;
                var sy = (span.start - x1) * window.devicePixelRatio;
                var sWidth = $(document).width() * window.devicePixelRatio;
                var sHeight = span.length * window.devicePixelRatio;
                var dx = 0;
                var dy = span.start;
                var dWidth = $(document).width();
                var dHeight = sHeight / sWidth * dWidth;

                pageCtx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
                console.debug("截图已更新: %s in [%i,%i]", JSON.stringify(span), x1, x2);
            };
            image.src = url;
        });
    }

    // 通知background对可视区域进行截图
    function screenshot(callback){
        $('#notepi-canvas').hide();
        // 延时的原因是。。如果不延时，hide之后立刻截图还是会把笔记截进来的
        setTimeout(function(){
            chrome.runtime.sendMessage({
                "command": "screenshot"
            }, function(screenshotUrl){
                $('#notepi-canvas').show();

                callback(screenshotUrl);
            });
        }, 300);
    }

    // Span对象构造函数
    function Span(start, end){
        console.assert(start < end);

        this.start = start;
        this.end = end;
        this.length = end - start;
    };

    // 判断指定坐标是否在span中
    Span.prototype.contains = function(x){
        return this.start <= x && x <= this.end;
    };

    // 两个span对象合并
    // 差值部分构成一个新的span对象返回
    // 注意在 r1.merge(r2) 中要求r1在r2前面
    Span.prototype.merge = function(other){
        console.assert(this.end <= other.start)

        var diff = null;
        if(this.end < other.start){
            diff = new Span(this.end, other.start);
        }

        // 将本span对象改变为合并后的对象
        // 同时意味着other对象无效，应该删除
        this.end = other.end;
        this.length = this.end - this.start;
        return diff;
    };

    // 将span延伸到x坐标处
    // 注意可以向后延伸也可以向前延伸
    // 差值部分构成一个新的span对象返回
    Span.prototype.extend = function(x){
        var diff = null;
        if( this.end < x ){
            diff = new Span(this.end, x);
            this.end = x;
            this.length = this.end - this.start;
            return diff;
        }else if( x < this.start ){
            diff = new Span(x, this.start);
            this.start = x;
            this.length = this.end - this.start;
            return diff;
        }

        return null;
    };
});
