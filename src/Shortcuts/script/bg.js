function moveleft() {
    chrome.windows.getCurrent(function (currentWindow) {
        chrome.tabs.query({windowId: currentWindow.id}, function (tabs) {
            var currentIndex = 0;
            for (var i = 0; i < tabs.length; i++) {
                if (tabs[i].active) {
                    currentIndex = i;
                    break;
                }
            }
            chrome.tabs.update(currentIndex - 1 < 0 ? tabs[tabs.length - 1].id : tabs[currentIndex - 1].id, {active: true});
        });
    });
}
function moveright() {
    chrome.windows.getCurrent(function (currentWindow) {
        chrome.tabs.query({windowId: currentWindow.id}, function (tabs) {
            var currentIndex = 0;
            for (var i = 0; i < tabs.length; i++) {
                if (tabs[i].active) {
                    currentIndex = i;
                    break;
                }
            }
            chrome.tabs.update(currentIndex + 1 > tabs.length - 1 ? tabs[0].id : tabs[currentIndex + 1].id, {active: true});
        });
    });
}
function closeright() {
    chrome.windows.getCurrent(function (currentWindow) {
        chrome.tabs.getSelected(null, function (tab) {
            var index = tab.index;
            chrome.tabs.query({active: false, pinned: false, windowId: currentWindow.id}, function (tabs) {
                var tabIds = new Array(tabs.length);
                var count = 0;
                for (let i = 0; i < tabs.length; i++)
                    if (tabs[i].index > index) {
                        tabIds[count] = tabs[i].id;
                        count++;
                    }
                var trimmed = new Array(count);
                for (let i = 0; i < count; i++)
                    trimmed[i] = tabIds[i];
                chrome.tabs.remove(trimmed);
            });
        });
    })
}
function closeleft() {
    chrome.windows.getCurrent(function (currentWindow) {
        chrome.tabs.getSelected(null, function (tab) {
            var index = tab.index;
            chrome.tabs.query({active: false, pinned: false, windowId: currentWindow.id}, function (tabs) {
                var tabIds = new Array(tabs.length);
                var count = 0;
                for (var i = 0; i < tabs.length; i++)
                    if (tabs[i].index < index) {
                        tabIds[count] = tabs[i].id;
                        count++;
                    }
                var trimmed = new Array(count);
                for (i = 0; i < count; i++)
                    trimmed[i] = tabIds[i];
                chrome.tabs.remove(trimmed);
            });
        });
    });
}
function duplicateCommand() {
    chrome.windows.getCurrent(function (currentWindow) {
        chrome.tabs.query({windowId: currentWindow.id}, function (tabs) {
            for (var i = 0; i < tabs.length; i++) {
                if (tabs[i].active) {
                    chrome.tabs.create({url: tabs[i].url});
                    break;
                }
            }
        });
    });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.ext) {
        chrome.tabs.update(null, {url: 'chrome://extensions/'})
    }
    else if (request.abt) {
        chrome.tabs.update(null, {url: 'chrome://help/'})
    }
    else if (request.history) {
        chrome.tabs.update(null, {url: 'chrome://history/'})
    }
    else if (request.home) {
        chrome.tabs.update(null, {url: 'chrome://newtab'})
    }
    else if (request.new) {
        chrome.tabs.create({url: 'chrome://newtab'});
    }
    else if (request.closetab) {
        chrome.tabs.getSelected(null, function (tab) {
            chrome.tabs.remove(tab.id);
        });
    }
    else if (request.closeall) {
        chrome.windows.getCurrent(function (currentWindow) {
            chrome.tabs.query({active: false, pinned: false, windowId: currentWindow.id}, function (tabs) {
                var tabIds = new Array(tabs.length);
                for (var i = 0; i < tabs.length; i++)
                    tabIds[i] = tabs[i].id;
                chrome.tabs.remove(tabIds);
            });
        });
    }
    else if (request.pin) {
        chrome.tabs.getSelected(null, function (tab) {
            chrome.tabs.update(tab.id, {'pinned': !tab.pinned});
        });
    }
    else if (request.right) {
        closeright()
    }
    // else if (request.duplicate) {
    //     duplicateCommand()
    // }
    else if (request.left) {
        closeleft()
    }
    else if (request.moveleft) {
        moveleft();
    }
    else if (request.moveright) {
        moveright();
    }
    else if (request.image) {
        uploadb64(request.image)
    }
// return true;
})

chrome.commands.onCommand.addListener(function (command) {

    switch (command) {

        case "ext":
            chrome.tabs.update(null, {url: 'chrome://extensions/'});
            break;
        case "home":
            chrome.tabs.update(null, {url: 'chrome://newtab'});
            break;
        case 'left':
            moveleft();
            break;
        case 'right':
            moveright();
            break;
        case 'closeright':
            closeright()
            break;
        case 'closeleft':
            closeleft()
            break;
        case 'duplicate':
            duplicateCommand()
            break;

    }
});
chrome.notifications.onButtonClicked.addListener(function (a, b) {
    chrome.tabs.create({url: a}, function () {
    });
    chrome.notifications.clear(a, function () {
    });
});
function uploadb64(base64) {
    fetch(base64)
        .then(res => res.blob())
        .then(blob => uploadImg(blob, function (e) {
            console.log(e)
            var opt = {
                type: "basic",
                title: "已成功上传并复制URL到剪贴板！",
                message: e.data.url,
                iconUrl: e.data.url,
                buttons: [
                    {title: "点我打开图片"}
                ]
            };
            new Audio("data/notify.mp3").play();
            chrome.notifications.create(e.data.url, opt, function (id) {
            });
            var copyFrom = document.createElement("textarea");
            copyFrom.textContent = e.data.url;
            var body = document.getElementsByTagName('body')[0];
            body.appendChild(copyFrom);
            copyFrom.select();
            document.execCommand('copy');
            body.removeChild(copyFrom);
        }))
}

chrome.browserAction.onClicked.addListener(function (tab) {
    setUpPasteAndFileInput(function (e) {
        for (var i = 0; i < e.clipboardData.items.length; i++) {
            if (e.clipboardData.items[i].kind == "file" && e.clipboardData.items[i].type == "image/png") {

                var imageFile = e.clipboardData.items[i].getAsFile();
                var fileReader = new FileReader();
                fileReader.onloadend = function () {
                    uploadb64(this.result)
                };
                fileReader.readAsDataURL(imageFile);
            }
            else {
                // var result = '出错了';
                // var opt = {
                //     type: "basic",
                //     title: "剪贴板中不是图片，上传取消！",
                //     message: result,
                //     iconUrl: chrome.extension.getURL('data/shortcut-icon.png'),
                //     buttons: [
                //         {title: "剪贴板中不是图片，上传取消！"}
                //     ]
                // };
                // new Audio("data/notify.mp3").play();
                // chrome.notifications.create(result, opt, function (id) {
                // });
                chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                    chrome.tabs.executeScript(tabs[0].id, {file: "script/fileinput.js"});
                });

            }
            break;
        }
    });
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        if (tabs[0].url.startsWith('http'))
            document.execCommand('paste');
        else {
            chrome.tabs.query({currentWindow: true}, function (tabs) {
                tabs.some(function (e) {
                    let isWebpage = e.url.startsWith('http');
                    if (isWebpage) {
                        chrome.tabs.update(e.id, {active: true});
                        document.execCommand('paste');

                    }
                    return isWebpage
                })
            });
        }
    });


});

function setUpPasteAndFileInput(pasteHandler) {
    if (!document.onpaste)
        document.onpaste = pasteHandler;
}


chrome.notifications.onClicked.addListener(function (a, b) {
    chrome.tabs.create({url: a}, function () {
    });
    chrome.notifications.clear(a, function () {
    });
});


function uploadImg(bin, callback) {
    var data = new FormData();
    data.append('smfile', bin);
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        callback(JSON.parse(xhr.responseText));
    };
    xhr.open('post', 'https://sm.ms/api/upload');
    xhr.send(data);

}

