var sc = {
    chromeGetWord: function (elem, x, y) {
        if (elem.nodeType == elem.TEXT_NODE) {
            let range = elem.ownerDocument.createRange();
            range.selectNodeContents(elem);
            var currentPos = 0;
            var endPos = range.endOffset;
            while (currentPos + 1 < endPos) {
                range.setStart(elem, currentPos);
                range.setEnd(elem, currentPos + 1);
                if (range.getBoundingClientRect().left <= x && range.getBoundingClientRect().right >= x &&
                    range.getBoundingClientRect().top <= y && range.getBoundingClientRect().bottom >= y) {
                    range.expand("word");
                    var ret = range.toString();
                    range.detach();
                    return (ret);
                }
                currentPos += 1;
            }
        } else {
            for (var i = 0; i < elem.childNodes.length; i++) {
                let range = elem.childNodes[i].ownerDocument.createRange();
                range.selectNodeContents(elem.childNodes[i]);
                if (range.getBoundingClientRect().left <= x && range.getBoundingClientRect().right >= x &&
                    range.getBoundingClientRect().top <= y && range.getBoundingClientRect().bottom >= y) {
                    range.detach();
                    return (this.chromeGetWord(elem.childNodes[i], x, y));
                } else {
                    range.detach();
                }
            }
        }
        return (null);
    },
    lookup: function (word) {
        var xhr = new XMLHttpRequest();
        var au = new Audio('http://dict.youdao.com/dictvoice?audio=' + word);
        au.play();
        xhr.onload = function () {

            var result = JSON.parse(xhr.responseText);
            var disp = '';

            if (result.basic && result.basic.explains) {
                disp += result.basic.explains.join('\n')
            }
            disp += '\n\n';
            if (result.translation)
                disp += result.translation.join('\n');
            document.getElementById('posxhztitle').innerText = word + ' :';
            document.getElementById('posxhzcontent').innerText = disp;
            document.getElementById('posxhz').style.left = x + 'px';
            document.getElementById('posxhz').style.top = y + 'px';
            document.getElementById('posxhz').style.display = 'block';
        };
        xhr.open('get', 'https://fanyi.youdao.com/fanyiapi.do?keyfrom=miniforce&key=812287220&type=data&doctype=json&version=1.1&q=' + word);
        xhr.send(null);
    },
    lookupHTMLTemplate: '<div id="posxhz" style="box-shadow: 5px 5px 9px #888888;position:absolute;padding: 20px; display:none;background: white;z-index: 2147483647;font-size: 15px;border-style: solid;border-color: #dddddd;border-width: 1px;"><div id="posxhztitle" style="font-size: larger; font-weight: bold;height: 32px;"></div><div id="posxhzcontent"></div></div>'

};