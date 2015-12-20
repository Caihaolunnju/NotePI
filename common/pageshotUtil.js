/**
 * 为其他层提供访问pageshot对应background服务的便利方法
 * 不需要再控制message的发送
 */

 var pageshotUtil = {
     'openPageshot': null
 };

 !function(){
     /**
      * 打开指定url的截图页面
      * @param  {string} url 页面的url
      */
     pageshotUtil.openPageshot = function(url){
         // 请求后台打开截图服务
         chrome.runtime.sendMessage({
             'command': 'openPageshot',
             'data': url
         });
     }
 }();
