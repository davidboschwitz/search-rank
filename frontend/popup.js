function itworked()
{
console.log('it worked');
  chrome.tabs.executeScript({
    file: 'alert.js'
  });
}

document.getElementById('keywords').addEventListener('click', itworked);

chrome.extension.onMessage.addListener(function(e){
  console.log(e);
  showSuggestions(e.suggs);
});

function showSuggestions(titles){
  var el = document.createElement('div');
  for(var i = 0; i < titles.length; i++){
    var tel = document.createElement('a');
    tel.href = 'https://www.google.com/?gws_rd=ssl#q=' + titles[i];
    tel.innerHTML = titles[i];
    el.appendChild(tel);
    el.appendChild(document.createElement('br'));
  }
  document.getElementById('suggs').innerHTML = '';
  document.getElementById('suggs').appendChild(el);
}

$(document).ready(function(){
   $('body').on('click', 'a', function(){
     chrome.tabs.create({url: $(this).attr('href')});
     return false;
   });
});
