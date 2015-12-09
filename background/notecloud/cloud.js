/**
 * 云端存储服务模块
 */

 require.config({
     paths: {
        'page': 'notecloud/page',
        'http': 'notecloud/http',
        'gdapi': 'notecloud/gdapi'
 　　}
 });

define(['page', 'gdapi'], function(Page, gdapi){
    // 在google drive上存储的根目录名
    var ROOT_NAME = 'notecloud';
    // 在每个页面文件夹中的页面数据名
    var PAGE_DATA_NAME = 'pagedata';
    // 内部存储的token值
    var token = '';

    /**
     * 使用指定的页面url创建一个page存储对象
     * 如果云端没有这个页面的文件夹，则为其创建文件夹。否则加载文件夹中的内容
     * 最后返回该存储对象
     * @param  {String}   pageUrl  存储对象对应的url
     * @param  {Function} callback callback(err, page)
     */
    var page = function(pageUrl, callback){
        console.debug('准备根目录...');
        prepareDir(token, ROOT_NAME, null, function(err, rootId){ // 这里的root指ROOT_NAME值的目录
            if(err) return callback(err);
            console.debug('准备页面目录...');
            // 每个页面都有自己的一个目录
            prepareDir(token, namify(pageUrl), rootId, function(err, pageDirId){
                console.debug('准备页面数据...');
                // 准备页面数据
                prepareFile(token, PAGE_DATA_NAME, pageDirId, function(err, fileId, pageData){
                    if(err) return callback(err);

                    var page = new Page();
                    page.__fileId__ = fileId;
                    page.__merge__(pageData);

                    callback(null, page);
                });
            });
        });
    };

    // 同步指定的页面数据
    var sync = function(page, callback){
        // 包装Page对象
        page = new Page(page);

        var fileId = page.__fileId__;
        if(!fileId) return callback(new Error('page对象中找不到fileId'));

        console.debug("准备对%s进行同步...", fileId);
        gdapi.get(token, fileId, function(err, cloudPage){
            if(err) return callback(err);

            page.__merge__(cloudPage);
            gdapi.update(token, {
                'fileId': fileId,
                'data': page
            }, function(err, fileId){
                callback(err, fileId);
            });
        });
    };

    /**
     * 设置或取出google drive的token
     * @param  {String} t token字符串
     */
    var gdtoken = function(t){
        // 如果没有传入参数则返回当前token
        if(!t) return token;
        token = t;
    };

    /**
     * 准备指定文件
     * @param  {[type]}   token    token
     * @param  {[type]}   fileName 要准备（创建）的文件名称
     * @param  {[type]}   parentId 在指定父目录下创建文件，默认为root
     * @param  {Function} callback callback(err, fileId, pageData)
     */
    function prepareFile(token, fileName, parentId, callback){
        parentId = parentId || 'root';

        // 先搜索指定文件是否存在
        gdapi.search(token, fileName, parentId, function(err, fileId){
            if(err) return callback(err);
            // 如果文件不存在则创建
            if(fileId == null){
                console.debug('页面文件%s不存在，创建...', fileName);
                gdapi.upload(token, {
                    'metadata':{
                        'title': PAGE_DATA_NAME,
                        'parents':[{'id': parentId}]
                    },
                    'data': page, // 创建一个空文本
                }, function(err, newFileId){
                    if(err) return callback(err);
                    callback(null, newFileId, {});
                });
            }
            // 如果存在则获取该文件，返回
            else{
                console.debug('页面文件%s(%s)已经存在，获取中...', fileName, fileId);
                gdapi.get(token, fileId, function(err, pageData){
                    callback(null, fileId, pageData);
                });
            }
        });
    }
    /**
     * 准备指定目录，返回目录的id
     * 如果目录不存在则创建一个
     * @param  {String}   token         token
     * @param  {String}   dirName       要准备（创建）的目录名称
     * @param  {String}   parentId      在指定父目录下创建目录，默认为root
     * @param  {Function} callback      callback(err, fileId)
     */
    function prepareDir(token, dirName, parentId, callback){
        parentId = parentId || 'root';
        // 先搜索指定目录是否存在
        gdapi.search(token, dirName, parentId, function(err, fileId){
            if(err) return callback(err);
            // 如果目录不存在则创建
            if(fileId === null){
                gdapi.createFolder(token, dirName, parentId, function(err, fileId){
                    if(err) return callback(err);
                    callback(null, fileId);
                });
            }
            // 否则准备完成，返回
            else{
                callback(null, fileId);
            }
        });
    }

    /**
     * 将url转化为合法的文件名
     * @param  {String} url url地址字符串
     * @return {String}     文件名
     */
    function namify(url){
        // 去掉头部http
        var matches = url.match(/(?:http:\/\/)?([0-9a-z.\/]+)$/);
        var name = null;
        if(matches && matches.length > 1){
            name = matches[1];
        }else{
            name = url;
        }

        // 去掉所有的点和斜杠
        return name.replace(/\./g,'').replace(/\//g,'')
    }

    return {
        'gdtoken': gdtoken,
        'page': page,
        'sync': sync
    };
});
