(function(){
	var Note = function(){}
	Note.prototype.URL = null;//��Ӧ��ҳ·��
	Note.prototype.NoteContent = null;//�ʼ�����
	Note.prototype.WebContent = null;//��Ӧ��ҳ����
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
		//��ʼ������������ͼ������Ӧ�¼���
		var note = new Note();
		note = getNotefromGD(url);//������ҳURL��google drive��ȡnote����
		if(note)
		{
			if(WebCompare(note.WebContent))//��ҳ�Ƿ�仯�Ƚ�
			{
				WebSizeFix(note.WebContent);//��ҳ��������
				NoteReappear(note);//�ʼ�����
			};
			else
			{
				WebLose(note);//��ҳʧЧ����
			}
		}
		else
		{
				//��ʼ�Ǳʼ�
		}
	}
	
	function record(){
		//�Ǳʼ�
		draw();//����
		rubber();//��Ƥ
	}
	
	function save(){
		//�ʼǱ���
		var note = new Note();
		Note.URL = url;//��ҳ·��
		Note.NoteContent = saveNCfromWP();//������ҳ�����еıʼ�����
		var webcontent = new WebContent();
		webcontent.Size = getSizeofWP();//������ҳ����
		webcontent.DomToNote = getDTNfomWP();//����ʼ���DOMԪ�ض�Ӧ��ϵ
		note.WebContent = webcontent;
		sendNotetoGD(note);//���ʼǱ��浽google drive
	}
	
	//��¼�ʼǹ��ܷ���
	function draw(){
		//����
	}
	function rubber(){
		//��Ƥ
	}
	
	//��ҳ����������
	function getSizeofWP(){
		//������ҳ����
	}
	function WebSizeFix(WebContent){
		//��ҳ��������
	}
	
	//��ҳ������У�鷽��
	function getDTNfomWP(){
		//����ʼ���DOMԪ�ض�Ӧ��ϵ
	}
	function WebCompare(webcontent){
		//��ҳ�Ƿ�仯�Ƚ�
	}
	function WebLose(note){
		//��ҳʧЧ����
	}
	
	//�ʼǱ��������ַ���
	function saveNCfromWP(){
		//������ҳ�����еıʼ�����
	}
	function NoteReappear(note){
		//�ʼ�����
	}
	
	//google drive��ȡ
	function getNotefromGD(url){
		//������ҳURL��google drive��ȡnote����
	}
	function sendNotetoGD(note){
		//���ʼǱ��浽google drive
	}
	
})();