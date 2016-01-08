# 更新日志

### 2016-1-8

默认使用正常模式，连接Google Drive

### 2015-12-30

popup页面中取消了保存与打开截图按钮。现在关闭画刷或橡皮时自动保存；如果网页存在截图数据则自动打开

**自动保存**
已设置为默认开启，分别位于content/note.js与content/pageshot.js中的AUTO_SYNC_INTERVAL变量中。如果有需要请自行关闭

保存模式默认还是本地模式。请多使用正常模式测试。
开关在background/notecloud.js里面的的cloud.configuration中


# 目录说明

*以下所有架构都仅是临时设定，如果觉得哪里不对欢迎修改*

- popup: popup页面相关
- content: contentPage相关
- background: eventPage等基础性功能
- common: 各部分通用模块
- resource: 项目中非代码资源，如icon
- vendor: 第三方库，如jquery, requirejs等
