(function(){
	var Note = function(){}
	Note.prototype.URL = null;//对应网页路径
	Note.prototype.NoteContent = null;//笔记内容
	Note.prototype.WebContent = null;//对应网页内容
	/*Note.prototype.getNoteContent = function(url){			
			this.NoteContent = getNCfromGD(url);
		}
	Note.prototype.getWebContent = function(url){
			this.WebContent = getWCfromGD(url);
		}
	Note.prototype.Save = function(){
			sendNtoGD();
		}*/
	var WebContent = function(){}
	WebContent.prototype.Size = null;
	WebContent.prototype.DomToNote = null;
	
	function init(){
		//初始化，即点击插件图标后的响应事件。
		var note = new Note();
		note = getNotefromGD(url);//根据网页URL从google drive读取note内容
		if(note)
		{
			if(WebCompare(note.WebContent))//网页是否变化比较
			{
				WebSizeFix(note.WebContent);//网页比例处理
				NoteReappear(note);//笔记重现
			};
			else
			{
				WebLose(note);//网页失效处理
			}
		}
		else
		{
				//开始记笔记
		}
	}
	
	function record(){
		//记笔记
		draw();//画笔
		rubber();//擦皮
	}
	
	function save(){
		//笔记保存
		var note = new Note();
		Note.URL = url;//网页路径
		Note.NoteContent = saveNCfromWP();//保存网页上现有的笔记内容
		var webcontent = new WebContent();
		webcontent.Size = getSizeofWP();//保存网页比例
		webcontent.DomToNote = getDTNfomWP();//保存笔记与DOM元素对应关系
		note.WebContent = webcontent;
		sendNotetoGD(note);//将笔记保存到google drive
	}
	
	//记录笔记功能方法
	function draw(){
		//画笔
	}
	function rubber(){
		//擦皮
	}
	
	//网页比例处理方法
	function getSizeofWP(){
		//保存网页比例
	}
	function WebSizeFix(WebContent){
		//网页比例处理
	}
	
	//网页保存与校验方法
	function getDTNfomWP(){
		//保存笔记与DOM元素对应关系
	}
	function WebCompare(webcontent){
		//网页是否变化比较
	}
	function WebLose(note){
		//网页失效处理
	}
	
	//笔记保存与重现方法
	function saveNCfromWP(){
		//保存网页上现有的笔记内容
	}
	function NoteReappear(note){
		//笔记重现
	}
	
	//google drive存取
	function getNotefromGD(url){
		//根据网页URL从google drive读取note内容
	}
	function sendNotetoGD(note){
		//将笔记保存到google drive
	}
	
})();