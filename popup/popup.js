$(function(){
    var closeTimeout = [];

    $('body').mouseout(function(){
        closeTimeout.push(setTimeout(function(){
            window.close();
        }, 800));
    });

    $('body').mouseover(function(){
        closeTimeout.forEach(function(to){
            clearTimeout(to);
        });
    });
});
