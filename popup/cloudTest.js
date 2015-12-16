/*
 * 以下是notecloud模块的测试
 */
!function(){
    var url = 'http://www.baidu.com';
    // page测试按钮监听
    $('#pageBtn').on('click', function(){
        console.debug('获取page对象...');
        notecloud.page(url, function(page){
            console.debug('得到对象:%s', JSON.stringify(page));

            console.debug('修改page对象...');
            // 清空所有自定义属性
            for(var key in page){
                // 跳过隐藏字段
                if(key.indexOf('__') >= 0) {
                    continue;
                }
                delete page[key];
            }
            // 加入任意字段
            page.list = [1,2,3,4,5,6,7];
            page.obj = {
                name: 'Tom',
                age: 30
            };

            console.debug('同步page对象...');
            notecloud.sync(page, function(){
                console.debug('同步完成');
                notecloud.page(url, function(page){
                    console.debug('同步后对象:%s', JSON.stringify(page));
                });
            });
        });
    });
}();
