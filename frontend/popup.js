function itworked()
{
console.log('it worked');
  chrome.tabs.executeScript({
    file: 'alert.js'
  });
}

document.getElementById('keywords').addEventListener('click', itworked);
