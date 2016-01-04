/**
 * 截图页面初始化脚本
 */

// 源网页的tabId
var srcTabId = Number(location.search.substring(1).match(/src=(\d+)/)[1]);

// 预定义define方法兼容部分模块
var define = function(mod){
    mod(function(){});
};

// note.js内部页面中提供给其他模块进行初始化动作的钩子函数
// 之所以有这个钩子是因为note.js在普通网页和插件页面的行为并不完全一样
// 比如在截图页面保存页面数据时，实际上调用的应该是源网页的保存函数而不是自己的，数据也保存到源网页的url下
var internalPageInit = function(pageAction){
    // 这里做了一个hack，重写页面中的saveNote方法来把saveNote方法转发到源网页中
    pageAction.saveNote = function(){
        chrome.tabs.sendMessage(srcTabId, {
            'cmd': 'saveNote'
        });
    };
};
