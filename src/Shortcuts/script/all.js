var timeoutHandler;
var currentWorld;
var x, y;


document.addEventListener('mousemove', function (e) {
    clearTimeout(timeoutHandler);
    timeoutHandler = setTimeout(function () {
        currentWorld = sc.chromeGetWord(e.target, e.x, e.y);
        if (currentWorld)
            currentWorld = currentWorld.trim();
        x = e.clientX;
        y = e.pageY;
    }, 100);
});
document.addEventListener('click', function (e) {
    if (e.target.id == 'posxhztitle' || e.target.id == 'posxhzcontent')
        return;
    document.getElementById('posxhz').style.display = 'none';
});
document.addEventListener('keydown', function (e) {
    //check if current cursor is in text editing area
    var el = document.activeElement;
    var isInText = el && (el.tagName.toLowerCase() == 'input' || el.tagName.toLowerCase() == 'textarea' || el.tagName.toLowerCase() == 'pre' || el.isContentEditable || el.className == 'ql-editor');
    var isModifier = (e.ctrlKey || e.altKey || e.shiftKey);
    if (!isInText)
        switch (e.keyCode) {
            //q key to look up work
            case 81:
            case 113:
                var t = getSelection().toString();
                t = t == '' ? currentWorld : t.trim();
                sc.lookup(t);
                e.preventDefault();
                break;
            //esc key to close looup window
            case 27:
                document.getElementById('posxhz').style.display = 'none';
                break;
            //e key to open chrome extension page
            case 69:
                chrome.runtime.sendMessage({ext: "ext"});
                break;
            //a key to open chrome about page
            case 65:
                chrome.runtime.sendMessage({abt: "abt"});
                break;
            // h/f1 key to open home page
            case 72:
                chrome.runtime.sendMessage({history: "history"});
                break;
            case 112:
                chrome.runtime.sendMessage({home: "home"});
                e.preventDefault();
                break;
            //x key close all
            case 88:
                chrome.runtime.sendMessage({closeall: "closeall"});
                break;
            //c key pin tab
            case 67:
                if (!e.ctrlKey) {
                    chrome.runtime.sendMessage({pin: "pin"});
                }
                break;
            //close tabs to the right
            case 82:
                chrome.runtime.sendMessage({right: "right"});
                break;
            //1 key move left
            case 49:
                if (!isModifier)
                    chrome.runtime.sendMessage({moveleft: "moveleft"});
                break;
            case 37:
                if (e.ctrlKey) {
                    chrome.runtime.sendMessage({moveleft: "moveleft"});
                }
                else if (!isInText && e.shiftKey && e.keyCode == 37)
                    chrome.runtime.sendMessage({left: "left"});

                break;
            //2 key move right
            case 50:
                if (!isModifier)
                    chrome.runtime.sendMessage({moveright: "moveright"});
                break;
            case 39:
                if (e.ctrlKey) {
                    chrome.runtime.sendMessage({moveright: "moveright"});
                }
                else if (e.shiftKey && e.keyCode == 39)
                    chrome.runtime.sendMessage({right: "right"});

                break;
            // t key create new tab
            case 84:
                chrome.runtime.sendMessage({new: "new"});
                break;
            //z key close tab
            case 90:
                chrome.runtime.sendMessage({closetab: "closetab"});
                break;
            // case 75:
            //     if (e.ctrlKey) {
            //         chrome.runtime.sendMessage({duplicate: document.URL});
            //     }

        }


});


document.body.insertAdjacentHTML('beforeend', sc.lookupHTMLTemplate);
var div = document.createElement('div');
div.id = 'fileUploadDiv';
div.innerHTML = '<button id="upfile" style="width: 100%;height:100%;padding: 0 1rem;text-align: center;vertical-align: middle;background-color: #ffffff;border: 1px #d9d9d9 solid;color: #262626;cursor: pointer;display: inline-block;outline: none;font-size: .875rem;line-height: 100%;margin: .15625rem 0;position: relative;">点我上传图片</button><input type="file" id="hiddenInputfile"  style="visibility:hidden;">';
div.style = 'width: 180px;height: 130px;z-index: 99999999; box-shadow: 5px 5px 5px #888888;position:fixed;right: 10px;top:10px;display:none;';
document.body.appendChild(div);
document.getElementById('fileUploadDiv').style = 'width: 180px;height: 130px;z-index: 99999999; box-shadow: 5px 5px 5px #888888;position:fixed;right: 10px;top:10px;display:none;';
document.getElementById('upfile').onclick = function () {
    document.getElementById('hiddenInputfile').click();
};
var fileinput = document.getElementById('hiddenInputfile');


//some page changed dom after load
setInterval(function () {
    var lookupDiv = document.getElementById('posxhz');
    if (!lookupDiv) {
        document.body.insertAdjacentHTML('beforeend', sc.lookupHTMLTemplate);
    }
}, 5000);


chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    // If the received message has the expected format...
    var a = document.getElementById('fileUploadDiv');
    if (msg.popFileUpload === 'enable') {
        // Call the specified callback, passing
        // the web-page's DOM content as argument

        a.style.display = 'block';
        //sendResponse(document.all[0].outerHTML);
    }
    if (msg.popFileUpload === 'disable') {
        if (a) {
            a.style.display = 'none';
            sendResponse('stop');
        }
    }
    fileinput.onchange = function () {
        var f = fileinput.files[0];
        if (!/image\/\w+/.test(f.type) || f == "undefined") {

        }
        else {
            a.style.display = 'none';
            var fileReader = new FileReader();
            fileReader.onloadend = function (ee) {
                var base64 = this.result.split(',')[1];
                sendResponse(base64);
            };
            fileReader.readAsDataURL(f);
        }
    };
    return true;
});



