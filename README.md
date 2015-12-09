# 目录说明

*以下所有架构都仅是临时设定，如果觉得哪里不对欢迎修改*

- popup: popup页面相关
- content: contentPage相关
- background: eventPage等基础性功能
- resource: 项目中非代码资源，如icon
- vendor: 第三方库，如jquery, requirejs等

# 关于Google Drive存储服务

Google Drive同步相关代码已经集成进项目中。如果要使用，请注意以下几点：
- 请先科学上网
- 可以直接使用popup/notecloud.js中暴露的接口来调用服务，它是通过向eventPage发送消息来请求实际的服务的。
- 当然也可以直接向eventPage发送消息
- manifest.json中有一个oauth2.client_id字段，用于向用户申请权限时验证插件身份，它和插件本身的id一一对应。但是我发现同一个项目被不同机器上的chrome加载后，插件id会发生改变，导致client_id和id对不上，插件在请求用户权限时就会出现问题。因此如果要测试Google Drive存储功能，建议使用你的chrome上显示的插件id去申请一个新的client_id填回这个字段即可

> 要申请一个client id，可以参考https://developers.google.com/drive/web/quickstart/js#step_1_turn_on_the_api_name
> 在第四步，我们的插件本质上说并不是网站而是Chrome App，因此这里类型选择Chrome App
> 然后名称随意，Application ID填写你的Chrome在『扩展程序』页面加载完本项目后显示的ID，应该是一个很长的无规律字符串
> 创建完成后，显示的client id就是我们要的oauth2.client_id值
