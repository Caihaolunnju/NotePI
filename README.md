# 目录说明

*以下所有架构都仅是临时设定，如果觉得哪里不对欢迎修改*

- popup: popup页面相关
- content: contentPage相关
- background: eventPage等基础性功能
- common: 各部分通用模块
- resource: 项目中非代码资源，如icon
- vendor: 第三方库，如jquery, requirejs等

# 关于Google Drive存储服务

### 使用须知
Google Drive同步相关代码已经集成进项目中。

为了与存储模块交互，引用common/notecloud.js模块再使用即可，使用方法可参见popup/cloudTest.js文件

notecloud模块已经默认设置成本地模式，即数据都可以存储在本地，而无需访问google drive，方便开发

### 不使用本地模式
本地模式和正常模式的唯一区别就是在background/eventPage.js中调用cloudSetup进行注册的时候，在cloud.configuration中指定了local=true，将这个选项注掉就是正常模式。

如果要使用正常模式，请注意以下几点：
- 请先科学上网
- 使用common/notecloud.js中暴露的接口来调用服务，它是通过向eventPage发送消息来请求实际的服务的。
- manifest.json中有一个oauth2.client_id字段，用于向用户申请权限时验证插件身份，它和插件本身的id一一对应（加载插件的时候会自动生成）。但是我发现即便是同一个项目，被不同机器上的chrome加载后插件id会发生改变，导致client_id和id对不上，插件在请求用户权限时就会出现问题。因此如果要测试Google Drive存储功能，建议使用你的chrome上显示的插件id去申请一个新的client_id填回这个字段即可

**更新：发现在mainfest.json文件文件中指定key就可以固定插件id，第三点的限制将不存在**

> 要申请一个client id，可以参考https://developers.google.com/drive/web/quickstart/js#step_1_turn_on_the_api_name
> 在第四步，我们的插件本质上说并不是网站而是Chrome App，因此这里类型选择Chrome App。然后名称随意，Application ID填写你的Chrome在『扩展程序』页面加载完本项目后显示的ID，应该是一个很长的无规律字符串。创建完成后，显示的client id就是我们要的oauth2.client_id值
