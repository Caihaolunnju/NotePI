/**
 * notecloud装配文件
 * 用于将notecloud功能挂载到eventPage页上
 * 是系统与notecloud之间的中间层
 */

// 在每个页面文件夹中的页面数据文件名
var PAGE_DATA_FILE = 'pagedata';
// 在每个页面文件夹中的截图文件名
var PAGESHOT_DATA_FILE = 'pageshotdata';

// 这里设置了本地模拟模式，数据将全部存储在本地的chrome.storage.local上面，方便开发
// 但是要注意的是，本地存储上限只有5MB，请谨慎使用
// cloud.configuration({
//     local: true, // 将这句话注掉就变成了正常模式，将与Google Drive交互，容量『理论上』不受限制
// });

// PS: 现在引入了自动测试机制，可以根据本地网络状态判断使用正常模式还是本地模式，不需要手动设置了

// 注册云存储消息监听
!function(cloud){
    // 监听page消息
    chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse){
        // page请求
        if(msg.command === 'page'){
            var url = msg.data;
            // 获取page对象
            cloud.file(url, PAGE_DATA_FILE, function(err, page){
                // chrome的响应消息只能发出一个对象，因此这里error就简单地输出
                if(err) return console.error(err);
                sendResponse(page);
                console.debug("page请求的响应已回送");
            });

            // 保持sendResponse有效
            return true;
        }

        // contentScript发来的拼接后的网页截图数据，需要保存
        if(msg.command === 'pageshot'){
            var url = msg.data;
            // 获取网页截图对象
            cloud.file(url, PAGESHOT_DATA_FILE, function(err, pageshot){
                if(err) return console.error(err);

                sendResponse(pageshot);
                console.debug("pageshot请求的响应已回送");
            });

            return true;
        }

        // sync请求
        if(msg.command === 'sync'){
            var page = msg.data;
            // 获取page对象
            cloud.sync(page, function(err){
                // chrome的响应消息只能发出一个对象，因此这里error就简单地输出
                if(err) return console.error(err);
                sendResponse();
                console.debug("sync请求的响应已回送");
            });
            return true;
        }
    });
}(cloud);
