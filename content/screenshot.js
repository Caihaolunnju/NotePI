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
                    return emit(x1, x2, diff);
                }
            }

            // 如果x1在一个span里但是x2不在，那就把这个span延伸到x2处
            var diff = spans[i].extend(x2);

            if(!diff) continue;
            return emit(x1, x2, diff);
        }

        // 如果没能包含x1但是有span包含了x2，则将这个span向前延伸到x1处
        if( spans[i].contains(x2) ){
            var diff = spans[i].extend(x1);
            if(!diff) continue;
            return emit(x1, x2, diff);
        }
    }

    if( x1 < x2 ){
        // 这是一个全新的span
        var span = new Span(x1, x2);
        spans.push(span);
        emit(x1, x2, span);
    }

    // 否则什么也不做
}

function emit(x1, x2, span){
    console.debug("in [%s,%s] requires span %s", x1, x2, JSON.stringify(span));
    console.debug(spans);
}

// 存放所有span的数组
var spans = [];

$(window).scroll(function(){
    var pageOffset = $(window).scrollTop();
    var visibleHeight = $(window).height();
    scroll(pageOffset, pageOffset + visibleHeight);
});

// 先行触发一次
scroll(0, $(window).height());

// 测试
/*
scroll(0, 100);
scroll(180, 280);
scroll(110, 210);
*/
