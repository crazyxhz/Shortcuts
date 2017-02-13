#Shortcuts Chrome效率插件
##Intro
自己写着玩的Chrome插件，自己用的理念就是越简单越好，快捷键可能有些激进。功能列表如下：

1. 快速查单词，鼠标悬停或者选中任意单词，按下`Q`键，即可查词（`Esc`或者空白处点击关闭查词框）
![录屏](https://ooo.0o0.ooo/2017/01/25/58889f8f059f1.jpg)

2. 快速上传图片，在剪贴板有图片的情况下，点击插件按钮，可以直接上传图片并且把图片URL复制到剪贴板。在剪贴板不是图片的情况下，自动弹出文件选择框，选择图片之后会自动上传图片并且把图片URL复制到剪贴板，支持GIF
![剪贴板内容上传](https://ooo.0o0.ooo/2017/01/26/588944c686c79.jpg)
![文件上传](https://ooo.0o0.ooo/2017/01/26/5889456c8b016.jpg)

3. Tab快捷键（非文本输入框状态下）：
      - `X` 关闭其他Tab
      - `C` Pin Tab
      - `R` **R**ight 关闭当前Tab右边的Tabs
      - `T` 创建新的**T**ab
      - `Z` 关闭当前Tab
      - `H` **H**istory 打开历史
      - `E` **E**xtension打开插件管理页面
    
    以上标签只能在Web页面中使用，在Chrome的 Custom Uri Tab下无法使用。另外，在插件设计页面最底部，可以设置全局快捷键， 
![如图](https://ooo.0o0.ooo/2017/01/25/5888a57e25d0a.jpg)

4. 禁用Google搜索结果跳转
![录屏](https://ooo.0o0.ooo/2017/01/25/5888a7a5ca050.jpg)

5. JD自动评价商品和订单

##安装方法
1. Chrome地址栏输入`chrome://extensions/`
2. 选中Developer Mode，选择Load unpacked extension![](https://ooo.0o0.ooo/2017/01/26/5889466f6b2ff.jpg)
3. 选择下载的Shortcuts文件夹

##关键代码
###鼠标悬浮查词
递归查找TextNode，在TextNode上创建range，在TextNode上从0开始通过`range.expand("word")`查找单词，返回第一个结果。
```javascript
function getWordAtPoint(elem, x, y) {
  if(elem.nodeType == elem.TEXT_NODE) {
    var range = elem.ownerDocument.createRange();
    range.selectNodeContents(elem);
    var currentPos = 0;
    var endPos = range.endOffset;
    while(currentPos+1 < endPos) {
      range.setStart(elem, currentPos);
      range.setEnd(elem, currentPos+1);
      if(range.getBoundingClientRect().left <= x && range.getBoundingClientRect().right  >= x &&
         range.getBoundingClientRect().top  <= y && range.getBoundingClientRect().bottom >= y) {
        range.expand("word");
        var ret = range.toString();
        range.detach();
        return(ret);
      }
      currentPos += 1;
    }
  } else {
    for(var i = 0; i < elem.childNodes.length; i++) {
      var range = elem.childNodes[i].ownerDocument.createRange();
      range.selectNodeContents(elem.childNodes[i]);
      if(range.getBoundingClientRect().left <= x && range.getBoundingClientRect().right  >= x &&
         range.getBoundingClientRect().top  <= y && range.getBoundingClientRect().bottom >= y) {
        range.detach();
        return(getWordAtPoint(elem.childNodes[i], x, y));
      } else {
        range.detach();
      }
    }
  }
  return(null);
}    
```
###上传图片
一般图床的REST API，接收的都是文件形式的表单
Chrome 插件获取了clipboardRead权限之后，可以在background script中获取到剪贴板数据。这里分为两种情况：
- 如果剪贴板中的内容是图片文件，则直接上传给图床接口
- 如果剪贴板中不是图片文件，则需要弹出上传文件窗口，这种情况下又有两种分支
  - 如果当前激活的窗口是Web页面，那么我们可以向当前页面注入脚本，模拟一个File Input的点击
  - 如果当前激活的窗口不是Web页面，那么我们在当前窗口查找Web页面的Tab，激活该Tab，然后注入脚本
```javascript
document.onpaste = function (e) {
    if (e.clipboardData.items.length) {
        if (e.clipboardData.items[0].kind == "file" && e.clipboardData.items[0].type == "image/png")
            uploadFile(e.clipboardData.items[0].getAsFile())
        else {
            chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                if (tabs[0].url.startsWith('http'))
                    chrome.tabs.executeScript(tabs[0].id, {file: "script/fileinput.js"});
                else {
                    chrome.tabs.query({currentWindow: true}, function (tabs) {
                        tabs.some(function (e) {
                            let isWebpage = e.url.startsWith('http');
                            if (isWebpage) {
                                chrome.tabs.update(e.id, {active: true}, function () {
                                    chrome.tabs.executeScript(e.id, {file: "script/fileinput.js"});
                                });
                            }
                            return isWebpage
                        })
                    });
                }
            });
        }
    }

};

chrome.browserAction.onClicked.addListener(function () {
    document.execCommand('paste');
});
```

`fileinput.js`文件内容
```javascript
var fileChooser = document.createElement("input");
fileChooser.type = 'file';
fileChooser.style.visibility = 'hidden'

fileChooser.addEventListener('change', function (evt) {
    var f = evt.target.files[0];
    if (f) {
        var reader = new FileReader();
        reader.onload = function (e) {
            chrome.runtime.sendMessage({image: this.result});
        }
        reader.readAsDataURL(f);
    }
});

document.body.appendChild(fileChooser);
fileChooser.click();
````
Web页面注入脚本，当我们获取了文件之后，由于跨域问题，无法直接在Web页面中直接上传文件，需要通过Chrome API `chrome.runtime.sendMessage` 将文件数据传回给background Script进行上传。另外，需要通过`reader.readAsDataURL`把二进制文件序列化为base64的string



  
 
