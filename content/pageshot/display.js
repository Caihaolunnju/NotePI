/**
 * 显示大型dataURL图片
 */
chrome.runtime.onMessage.addListener(function(msg){
    if(msg.command === 'displayDataURL'){
        var dataURL = msg.data.dataURL;
        var pic = document.getElementById('pic');
        pic.src = dataURL;
    }
});

console.log(chrome.identity.getAuthToken);
