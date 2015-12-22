# 更新日志

### 2015-12-22 开启了wiki页面

以后文档可以都放在wiki里面。

### 2015-12-20 添加了页面截图与重现功能

由于chrome只能够对可视区域进行截图，因此要得到网页完整的截图是比较困难的。目前的思路就是用户看到多少就截多少。实现如下：

在加载网页后的若干秒后会对当前页面进行截图，暂时保存在内存中。
滚动网页后，等待2s会自动计算哪些部分没有截到过，然后裁剪出需要的部分拼接到网页的截图中（因此理论上讲滚过网页的所有内容后应该就可以得到一张完整的网页截图）

点击保存可以将截图保存到localStorage（本地模式）或者google drive（正常模式）中
需要注意的是，可能会由于带宽的限制，保存到google drive的速度可能并不会很快...

保存后点击打开截图就可以显示出截图内容了。

------

已将SVG编辑器独立了出来，暂时命名为note.js，如果有必要请自行修改。
另外，content文件夹下的note.js和pageshot.js由于有存储内容获取的动作，可能会涉及到云端文件夹的创建。为了避免冲突，在contentScript.js中强制对其初始化进行了串行处理。不知道有没有更优雅的办法。

------

如果需要临时关闭某些功能，可以在manifest.json中将功能对应的脚本注释掉（比如想关闭截图功能，可以注释掉content_scripts > js > "content/pageshot.js"）。
有些IDE或者编辑器可能会报错，因为JSON标准里是不允许有注释的。不过只要是合法的js语句就没问题。


### 2015-12-16 去requirejs化重构

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
