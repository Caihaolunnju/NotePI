require.config({
    paths: {
        'jquery': '../vendor/jquery-2.1.4.min',
        'cloudTest': 'cloudTest',
        'notecloud': '../common/notecloud'
　　}
});

requirejs(['jquery','cloudTest','notecloud'], function($,ct,notecloud){
   //  ct.setup();
   /*
    * “画笔”和“橡皮”的功能
    */
    $('#brush').click(function(){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: "brush"});
        });
    });

    $('#eraser').click(function(){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: "eraser"});
        });
    });

    $('#save').click(function(){
        chrome.tabs.query({active: true, currentWindow: true},function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: "save"},function(response){
            	var url=response.url;
                var pathArray=response.pathArray;
                console.debug(url);
                console.debug(pathArray);
                notecloud.page(url, function(page){
                	page.shapes = pathArray;
	                notecloud.sync(page,function(){
	                	notecloud.page(url, function(page){
	                        console.debug('同步后对象:%s', JSON.stringify(page));
	                    });
	                });
                });
            });
         });
    });
});
