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
       chrome.tabs.sendMessage(tabs[0].id, {cmd: "save"});
    });
});
