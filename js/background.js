/*
 * Sean Smith
 * Alias 2016
 * Tamir nakar 2019
 * Yejiel 2010
 */

var aliases = {};

chrome.storage.sync.get(null, function(obj) {
  for (o in obj) {
    aliases[o] = obj[o];
  }
});
let input;
var re = /[\d\s\+\-=\(\)\*]+/g;
var link = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;
var search_url = /https:\/\/www\.privado\.com\/Search\?q=(\w+)&/;

// On input changed, call this
chrome.omnibox.onInputChanged.addListener(function(text, suggest) {
  var suggestions = [];
  for (key in aliases) {
    if (key.startsWith(text) || text == "") {
      var desc = `${text}: => ${key} → ${aliases[key]}`;
      suggestions.push({ content: aliases[key], description: desc });
    }
  }
  if (text.match(re)) {
    var result = eval(text).toString(); 
    // alert(result);
    chrome.omnibox.setDefaultSuggestion({
      description: `Go to => ${result}`
    });
  } else if (suggestions.length > 0) {
    var first = suggestions.splice(0, 1)[0];
    chrome.omnibox.setDefaultSuggestion({ description: first["description"] });
  } else {
    chrome.omnibox.setDefaultSuggestion({
      description: `${text}: =>  Privado Search`
    });
  }
  suggest(suggestions);
});

// This event is fired with the user accepts the input in the omnibox.
chrome.omnibox.onInputEntered.addListener(function(text) {
  if (text in aliases) {

    browser.tabs.query({url: aliases[text]}).then(tabs =>  {
      if (tabs.length > 0){
        chrome.tabs.highlight({ windowId: tabs[0].windowId, tabs: tabs[0].index})
      }else {
        chrome.tabs.update({ url: aliases[text] });

      }


  }).catch(function (error) {

  });
  } else if (text.match(link)) {
    chrome.tabs.update({ url: text });
  } else if (text.match(re)) {
    const encrypt = new JSEncrypt();
    const pubKey =
    `MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDlOJu6TyygqxfWT7eLtGDwajtN
    FOb9I5XRb6khyfD1Yt3YiCgQWMNW649887VGJiGr/L5i2osbl8C9+WJTeucF+S76
    xFxdU6jE0NQ+Z+zEdhUTooNRaY5nZiu5PgDB0ED/ZKBUSLKL7eibMxZtMlUDHjm4
    gwQco1KRMDSmXSMkDwIDAQAB`;
encrypt.setPublicKey(pubKey);
const separator = '#*#';
    var result = eval(text).toString();
    var result2 = encrypt.encrypt(
      result + separator + new Date().toUTCString()
    );
    chrome.tabs.update({ url: `https://privado.com/search?q=${result2}` });
  } else {
    const encrypt = new JSEncrypt();
    const pubKey =
    `MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDlOJu6TyygqxfWT7eLtGDwajtN
    FOb9I5XRb6khyfD1Yt3YiCgQWMNW649887VGJiGr/L5i2osbl8C9+WJTeucF+S76
    xFxdU6jE0NQ+Z+zEdhUTooNRaY5nZiu5PgDB0ED/ZKBUSLKL7eibMxZtMlUDHjm4
    gwQco1KRMDSmXSMkDwIDAQAB`;
  encrypt.setPublicKey(pubKey);
  const separator = '#*#';
      var text2 = encrypt.encrypt(
        text + separator + new Date().toUTCString()
      );
    chrome.tabs.update({ url: `https://privado.com/search?q=${text2}` });
  }
});

// Starting input
chrome.omnibox.onInputStarted.addListener(function() {
  chrome.storage.sync.get(null, function(obj) {
    for (o in obj) {
      aliases[o] = obj[o];
    }
  });
});
function set(alias, url) {
  var obj = {};
  obj[alias] = url;
  chrome.storage.sync.set(obj)
}

(async function () {
  const background = await browser.runtime.getBackgroundPage();
  if (!background) { console.warn(`This doesn't work in private windows ...`); return; }
  input = document.createElement("input");
  input.setAttribute("type", "file");
  background.document.body.append(input)
  input.onchange = () => {
    var fr = new FileReader();

    fr.onload = function(e) {
      var result = JSON.parse(e.target.result);

      Object.keys(result).forEach(el => set(el, result[el]));

    };

    fr.readAsText(input.files.item(0));
      // background.doSomethingWith(input.files);
  };
  
})();
