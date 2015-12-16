# 更新日志

2015-12-16 去requirejs化重构

由于以下原因，建议不再使用require.js:
- 由于资源文件都在本地，因此使用require.js的异步加载意义不大
- contentScript中使用require.js似乎存在着一些问题（要加载一个本地资源却会去请求网站本身的资源）
- 一些较为复杂的部分（如notecloud部分）加载的时候路径配置较为繁琐
- require.js本身也具有一定的复杂性

项目本身还是需要保持模块化的，因此建议使用以下方案：
- 新的功能写在js文件里面以后，将这个文件注册到manifest.json的对应位置中，比如background.scripts或者content_scripts.js（但是popup相关的脚本似乎只能注册到popup.html上面？）
- 由于所有加载的模块都共用一个命名空间，因此在自己编写的模块中请注意尽量避免污染全局变量（可参考background/notecloud/cloud.js实现类似命名空间的效果）

# 目录说明

*以下所有架构都仅是临时设定，如果觉得哪里不对欢迎修改*

- popup: popup页面相关
- content: contentPage相关
- background: eventPage等基础性功能
- common: 各部分通用模块
- resource: 项目中非代码资源，如icon
- vendor: 第三方库，如jquery, requirejs等
