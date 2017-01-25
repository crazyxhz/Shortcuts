function homepage() {
    var b = document.createElement('button')
    b.style.width = '100px'
    b.style.height = '50px'
    b.innerText = '自动评价连接'
    b.style.position = 'fixed'
    b.style.top = '10px'
    b.style.left = '10px'
    b.onclick = function () {
        window.location.href = 'http://club.jd.com/myJdcomments/myJdcomments.action';
    }
    document.body.appendChild(b)
}
function commentPage() {
    !function () {
        var content = "东西不错，京东物流很给力，听说评价可以拿京豆";
        var a = document.getElementsByClassName("btn-9 fail-close");
        a.length > 0 && a[0].click();
        var b = document.getElementsByClassName("btn-9")[0];
        if (null != b) {
            for (var c = 0; c < 2; c++) {
                b.click();
                var d = document.getElementsByClassName("area area01")[0];
                d.value = content, d.setAttribute("id", "id0"), $("#id0").blur();
                var e = document.getElementsByClassName("star4")[0];
                e.click()
            }
            var f = document.getElementsByClassName("btn-5 mr10 setcomment")[0];
            f.click(), setTimeout(arguments.callee, 5000)
        }
    }()


}

function commentOrder() {
    function openCommnetPage(para) {
//http://stackoverflow.com/questions/19328143/xmlhttprequest-to-fetch-dom-with-dynamic-content
        var iframe = document.createElement('iframe');
        iframe.src = para.url
        // Remove iframe when the content has (not) loaded
        iframe.onerror =
            iframe.onload = function () {
                setTimeout(function () {
                    iframe.parentNode.removeChild(iframe);
                }, 5000);
            };
        // Put security restrictions on the iframe
        // iframe.sandbox = 'allow-scripts';
        // Make frame invisible
        iframe.style.height = '1px';
        iframe.style.width = '1px';
        iframe.style.position = 'fixed';
        iframe.style.top = '-9px';
        iframe.style.left = '-9px';
        // Insert iframe in the document, and load its content
        document.body.appendChild(iframe);
        iframe.onload = function () {
            setTimeout(function () {
                iframe.contentWindow.document.querySelector('#activityVoucher > div.fi-operate.z-tip-warn > div > div.commstar-group > div:nth-child(1) > span.commstar > span.star.star5').click()
                iframe.contentWindow.document.querySelector('#activityVoucher > div.fi-operate.z-tip-warn > div > div.commstar-group > div:nth-child(2) > span.commstar > span.star.star5').click()
                iframe.contentWindow.document.querySelector('#activityVoucher > div.fi-operate.z-tip-warn > div > div.commstar-group > div:nth-child(3) > span.commstar > span.star.star5').click()
                var thirdParty = iframe.contentWindow.document.querySelector('#activityVoucher > div.fi-operate.z-tip-warn > div > div.commstar-group > div:nth-child(4) > span.commstar > span.star.star5')
                if (thirdParty)
                    thirdParty.click()
                iframe.contentWindow.document.querySelector('#container > div > div > div.mycomment-form > div.f-btnbox > a').click()
                console.log('正在处理第' + (para.count + 1) + '条记录');
                setTimeout(function () {
                    iframe.remove()
                }, 100)
            }, 2000)
        }
    }

    var a = document.querySelectorAll('#main > div.mycomment-bd > div.mycomment-table > table > tbody > tr > td > div > a.btn-def')
    for (var i = 0; i < a.length; i++) {
        var link = a[i].href;
        setTimeout(openCommnetPage, 2000 * i + 50, {url: link, count: i})

    }
}

switch (document.URL) {
    case 'http://club.jd.com/myJdcomments/myJdcomments.action':
    case 'https://club.jd.com/myJdcomments/myJdcomments.action':
    case 'http://club.jd.com/myJdcomments/myJdcomments.action#none':
        setTimeout(function () {
            var script1 = document.createElement("script");
            script1.textContent = "(" + commentPage.toString() + ")();";
            if (document && document.body) document.body.appendChild(script1);
        }, 3000)
        // commentPage();
        break;
    case  'http://home.jd.com/':
    case  'https://home.jd.com/':
        homepage()
        break;
    case 'http://club.jd.com/myJdcomments/myJdcomment.action':
    case 'https://club.jd.com/myJdcomments/myJdcomment.action':
        setTimeout(commentOrder, 2000)
        // commentOrder()
        break;
}