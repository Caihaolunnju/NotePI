/**
 * 后台公共部分代码写这里
 */

// 网络连通性检查，从而判断使用正常模式还是本地模式
connectionTest();

function connectionTest(){
    var xhr = new XMLHttpRequest();
    // 测试连接google drive
    xhr.open("GET", "https://www.google.com/drive/", true);
    xhr.timeout = 5000; // 测试等待时间

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            // 连通成功，使用正常模式
            cloud.configuration({ local: false });
            console.debug("using normal mode");
        }else {
            // 连通失败，使用本地模式
            cloud.configuration({ local: true });
            console.debug("using local mode(connection blocked)");
        }
    }
    xhr.send();
}
