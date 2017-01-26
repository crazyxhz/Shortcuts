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
        // uploadFile(request.image)
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
function uploadFile(file) {
    uploadImg(file, function (e) {
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
    })
}
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

