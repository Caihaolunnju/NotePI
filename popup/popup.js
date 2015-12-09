require.config({
    paths: {
        'jquery': '../vendor/jquery-2.1.4.min',
        'notecloud': './notecloud'
　　}
});

requirejs(['jquery', 'notecloud'], function($, notecloud){
    $(function(){
        // page测试按钮监听
        $('#pageBtn').on('click', function(){
            console.debug('获取page对象...');
            notecloud.page('http://www.baidu.com', function(page){
                console.debug('修改page对象...');
                page.list = [1,2,3,4,5,6,7,8];

                console.debug('同步page对象...');
                notecloud.sync(page, function(){
                    console.log('同步完成');
                });
            });
        });
    });
});
