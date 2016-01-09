$(function(){
    var closeTimeout = [];

    $('body').mouseout(function(){
        closeTimeout.push(setTimeout(function(){
            window.close();
        }, 800));
    });

    $('body').mouseover(function(){
        while(closeTimeout.length > 0){
            var to = closeTimeout.pop();
            clearTimeout(to);
        }
    });
});
