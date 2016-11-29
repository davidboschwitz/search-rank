function itworked()
{
  chrome.tabs.executeScript({
    file: 'alert.js'
  });
  console.log('it worked');
}

document.getElementById('keywords').addEventListener('click', itworked);
