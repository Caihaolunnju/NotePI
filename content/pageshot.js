var pageCanvas = document.createElement('canvas');
pageCanvas.height = $(document).height();
pageCanvas.width = $(document).width();
var pageCtx = pageCanvas.getContext('2d');

// 存放所有span的数组
var spans = [];

var begins = false; // 截图开始flag
var cooling = false; // 冷却时间，防止快速滚动的时候频繁截图
var coolTimeout = null;

// 来自popup的pageshot相关消息处理
chrome.runtime.onMessage.addListener(function(msg){
    if(msg.command === 'tabSavePageshot'){
        console.debug("保存截图...");
        var currentURL = window.location.href;

        notecloud.pageshot(currentURL, function(pageshot){
            pageshot.data = pageCanvas.toDataURL();
            notecloud.sync(pageshot, function(){
                console.debug('截图同步完成');
            });
        });
    }

    if(msg.command === 'tabOpenPageshot'){
        console.debug("打开截图...");
        var currentURL = window.location.href;
        pageshot.openPageshot(currentURL);
    }
});

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
        }, 2000);
    }
});

// 先行触发一次
setTimeout(function(){
    begins = true;
    validScroll();
}, 4000);

// 有效的滚动操作触发
function validScroll(){
    var pageOffset = $(document).scrollTop();
    var visibleHeight = $(window).height();
    scroll(pageOffset, pageOffset + visibleHeight);
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
            var sWidth = image.width;
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
    chrome.runtime.sendMessage({
        "command": "screenshot"
    }, function(screenshotUrl){
        callback(screenshotUrl);
    });
}
