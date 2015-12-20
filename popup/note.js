/*
 * “画笔”和“橡皮”的功能
 */
$('#brush').click(function(){
   chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
       chrome.tabs.sendMessage(tabs[0].id, {cmd: "brush"});
   });
});

$('#eraser').click(function(){
   chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
       chrome.tabs.sendMessage(tabs[0].id, {cmd: "eraser"});
   });
});

$('#save').click(function(){
   chrome.tabs.query({active: true, currentWindow: true},function(tabs) {
       chrome.tabs.sendMessage(tabs[0].id, {cmd: "save"},function(response){
           var url=response.url;
           var pathArray=response.pathArray;
           console.debug(url);
           console.debug(pathArray);
           notecloudUtil.page(url, function(page){
               page.pathArray = pathArray;
               notecloudUtil.sync(page,function(){
                   notecloudUtil.page(url, function(page){
                       console.debug('同步后对象:%s', JSON.stringify(page));
                   });
               });
           });
       });
    });
});
