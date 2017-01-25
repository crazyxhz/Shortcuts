//http://stackoverflow.com/questions/26884140/open-import-file-in-a-chrome-extension
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