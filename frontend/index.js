var data = [];
var topKeywords = [];
var votes = {};
chrome.storage.sync.get(function(items) {
    votes = items.votes;
    if (votes == undefined)
        votes = {};
})

$(window).on('load', function() {
    window.setTimeout(loadit, 1000);
    injectScripts();
});

function injectScripts(){
  injectJS(chrome.extension.getURL('/inject.js'));
  injectCSS(chrome.extension.getURL('/inject.css'));
}

function injectCSS(src) {
   var el = document.createElement('link');
   el.rel = "stylesheet";
   el.href = src;
   document.head.appendChild(el);
}

function injectJS(src) {
     var el = document.createElement('script');
     el.type = "text/javascript";
     el.src = src;
     el.id = 'injectedSEARCHJS';
     document.head.appendChild(el);
}
// var evt = document.createEvent('Event');
// evt.initEvent('myCustomEvent', true, false);
// this.dispatchEvent(new CustomEvent('vote', {
//     'detail': {
//         'direction': updown,
//         'uid': uid,
//         'index': index
//     }
// // }));
// function vote(event){
//   console.log('new vote', event);
//   var index = event.detail.index;
//   var direction = event.detail.direction;
//   var uid = event.detail.uid;
//   var x = data[index];
//   var include = direction == 'up';
//   var tmp = $(x.element).children().children().children().children();
//   tmp.removeClass('up');
//   tmp.removeClass('down');
//   tmp.addClass(direction);
// }
function davidHashelhoff(input){
   var hash = 0;
   if (input === undefined || input === null || input.length == 0)
       return hash;
   for (i = 0; i < input.length; i++) {
       char = input.charCodeAt(i);
       hash = ((hash<<5)-hash)+char;
       hash = hash & hash; // Convert to 32bit integer
   }
   return hash;
}

function addVoteListener() {
  votelistener = true;
  document.addEventListener('vote', function(event) {
        // do whatever is necessary
        console.log('vote', event)
        var index = event.detail.index;
        var direction = event.detail.direction;
        var x = data[index];
        var uid = davidHashelhoff(x.url);

        var doubleflag = 1;
        if (votes[uid] + 1) {
            if ((direction == 'up' ? 1 : 0) == votes[uid])
                return;
            doubleflag = 2;
        }
        console.log(direction);
        x.direction = direction;
        // x.votes = x.votes + (direction == "up" ? doubleflag * 1 : doubleflag * -1);
        // $($(x.element).children().children().children().children()[0]).children('.votes')[0].innerHTML = x.votes;
        var tmp = $(x.element).children().children().children().children();
        console.log(tmp)
        tmp.removeClass('up')
        tmp.removeClass('down')
        tmp.addClass(direction)

        //update the local memory

   votes[uid] = (direction == 'up' ? 1 : 0);

   //update the storage with local memory
   chrome.storage.sync.set({
       votes: votes
   });

   data[index] = x;

        // var oReq = new XMLHttpRequest();
        // oReq.open("GET", "https://vps.boschwitz.me:8443/vote/" + uid + "/" + direction);
        // oReq.send();
        // if (doubleflag == 2) {
        //     var oReq2 = new XMLHttpRequest();
        //     oReq2.open("GET", "https://vps.boschwitz.me:8443/vote/" + uid + "/" + direction);
        //     oReq2.send();
        // }
        // votes[uid] = (direction == 'up' ? 1 : 0);
        // chrome.storage.sync.set({
        //     votes: votes
        // });
        // sort();
    });
}

document.addEventListener('loadKeywords', function(event){
 console.log(event);
 loadkeywords();
});
//to fire loadit whenever someone does a new search, i'd do something like

$('.lsb, .sbico-c').click(function() {
    loadit()
});

$(document).keypress(function(e){
// console.log(e.which);
if(e.which == 26)
  loadit();
});

//and

$('#lst-ib').keypress(function(e) {
    //enter pressed
    if (e.which == 13)
        loadit()
});

//should do it (I think)
function addLoader() {
    var el = document.createElement('div');
    el.id = "loader";
    el.innerHTML = `<div class="progress">
      <div class="indeterminate"></div>
  </div>`;
    document.body.childNodes[0].appendChild(el)
}
votelistener = false;

function loadit() {
  $('#viewport').css('opacity', '0.3');
  if(document.getElementById('injectedSEARCHJS') == null){
    injectScripts();
  }
    addLoader();
    if (!votelistener) addVoteListener();
    console.log('loadingit')

    var len = $('.rc').length;
    $('.rc').each(function(i) {
        var x = {};
        x.index = i;
        x.element = this;
        x.url = this.childNodes[0].childNodes[0].href;

        data[i] = x;

        // function handledata(data) {
            console.log(data);
            //x.uid = data.data[0].uid;
            //x.votes = data.data[0].votes;
            x.uid = davidHashelhoff(x.url);
            x.element.innerHTML = '<table><tbody><tr><td style="text-align:center" class="'
                                  + (votes[x.uid] + 1 ? (votes[x.uid] == 1 ? 'up' : 'down') : '') + '"><span onclick="vote(this,'
                                  + x.index + ',\'up\')"><img src="' + chrome.extension.getURL('/upvote.png')
                                  + '" style="filter:grayscale(100%)" class="uparrow" /></span><br><span class="votes">' //+ x.votes
                                  + '</span><br><span onclick="vote(this,' + x.index + ',\'down\')"><img src="'
                                  + chrome.extension.getURL('/downvote.png')
                                  + '" style="filter:grayscale(100%)" class="downarrow" /></span></td><td>' + x.element.childNodes[0].innerHTML
                                  + (x.element.childNodes[1] ? x.element.childNodes[1].innerHTML : "") + '</td></tr></tbody></table>';
            // here is the best place you could inject your html into the element using x.element.innerHTML or something

            $('#viewport').css('opacity', '1')
            // if (i == len - 1) {
            //     //everything is done loading here, load keywords
            //     loadkeywords();
            // }
        // }
        // $.ajax({
        //     type: 'POST',
        //     url: "https://vps.boschwitz.me:8443/geturl",
        //     data: JSON.stringify({
        //         url: x.url
        //     }),
        //     contentType: 'application/json',
        //     dataType: 'json',
        //     success: handledata
        // });
    });
}


function loadkeywords() {
    //must run after loadit
    console.log('loadkeywords')
    console.log(data.length)
    console.log(data);
    console.log(votes);
    var urls = [];
    for (var i = 0; i < data.length; i++) {
      if (votes[data[i].uid]){
        urls.push(data[i].url)
      }
    }

    function handledata(rtn) {
        console.log(rtn);
        for (var i = 0; i < rtn.keywords.length; i++) {
            if (data[i] == undefined)
                continue;
            data[i].keywords = rtn.keywords[i];

            var title_keywords = "Top Keywords: ";
            for (var j = 0; rtn.keywords[i] != null && j < rtn.keywords[i].length && j < 3; j++) {
                title_keywords += rtn.keywords[i][j].term + ", ";
                if (j == 0) topKeywords[i] = rtn.keywords[i][j].term;
            }

            data[i].title = title_keywords.substring(0, title_keywords.length - 2);
            // $(data[i].element).children('.r').children('a')[0].title = data[i].title;
            console.log($(data[i].element).children('table').children('tbody').children('tr').children('td').children('a'))
            $(data[i].element).children('table').children('tbody').children('tr').children('td').children('a')[0].title = data[i].title;
            console.log($(data[i].element).children('.r').children('a')[0]);
            console.log(title_keywords)
        }
        //everything is done
        afterload();
    }
    console.log({
        urls: urls
    });
    $.ajax({
        type: 'POST',
        url: "https://vps.boschwitz.me:8443/keywords",
        data: JSON.stringify({
            urls: urls
        }),
        contentType: 'application/json',
        dataType: 'json',
        success: handledata
    });
}

function afterload() {
    //this is called after everything is loaded from the server
    //sort()
    var keywordString = "\t\t\tTop keywords = " + topKeywords[0];
    var index = 1;
    var kwCount = 1;
    for (i = 1; i < topKeywords.Count; i++) {
      if(kwCount < 5 && !keywordString.contains(topKeywords[i]))
      {
        keywordString += ", " + topKeywords[i];
      }
    }
    var keywordNode = document.createElement('div');
    keywordNode.appendChild(document.createTextNode(keywordString));
    keywordNode.style.textAlign = "center";
    $(keywordNode).addClass('spell _uwb');
    keywordNode.style.color = '#042ca1';
    document.getElementById("appbar").appendChild(keywordNode);
    var el = document.createElement('script');
    //data = ` + JSON.stringify(data) + `; \n
    el.innerHTML = `function vote(e, index, uid, updown){
    document.dispatchEvent(new CustomEvent('vote', {
        detail: {
            direction: updown,
            uid: uid,
            index: index
        }
    }));
  }`;
    var th = document.getElementsByTagName('body')[0];
    th.appendChild(el);
    var el = document.createElement('style');
    //data = ` + JSON.stringify(data) + `; \n
    el.innerHTML = `.up>span>.uparrow {
      filter: grayscale(0%)!important;
    }
    .down>span>.downarrow {
      filter: grayscale(0%)!important;
    }
    `;
    var th = document.getElementsByTagName('body')[0];
    th.appendChild(el);
    console.log(el);
    console.log('everything is loaded');
    $('#viewport').css('opacity', '1')
}

//These three functions will sort the data based on the vote integer using merge sort
function sort() {
    console.log('sorting');
    //console.log(data);
    insertionSort();
    //console.log(data);
}

function insertionSort() {
    //9, 4, 2, 0, 3...
    var len = data.length;
    var value, i, j, votes, uid;
    for (i = 0; i < len; i++) {
        value = data[i];
        for (j = i - 1; j > -1 && Number(data[j].votes) < Number(data[j + 1].votes); j--) {
            //console.log(data[j].votes + ' ' + data[j+1].votes + ' ' + j);
            votes = data[j + 1].votes;
            value = data[j + 1].element.innerHTML;
            uid = data[j + 1].uid;
            keywords = data[j + 1].keywords;

            data[j + 1].votes = data[j].votes;
            data[j + 1].uid = data[j].uid;
            data[j + 1].element.innerHTML = data[j].element.innerHTML;
            data[j + 1].keywords = data[j].keywords;
            var x = data[j + 1];
            x.index = j + 1;
            $(x.element).children().children().children().children()[0].innerHTML = '<span onclick="vote(this,' + x.index + ',' + x.uid
                                                                                  + ',\'up\')"><img src="' + chrome.extension.getURL('/upvote.png')
                                                            + '" style="filter:grayscale(100%)" class="uparrow"  /></span><br><span class="votes">'
                                                            + x.votes + '</span><br><span onclick="vote(this,' + x.index + ',' + x.uid
                                                            + ',\'down\')"><img src="' + chrome.extension.getURL('/downvote.png')
                                                            + '" style="filter:grayscale(100%)" class="downarrow"  /></span>'

            data[j].votes = votes;
            data[j].element.innerHTML = value;
            data[j].uid = uid;
            data[j].keywords = keywords;
            var x = data[j];
            x.index = j;
            $(x.element).children().children().children().children()[0].innerHTML = '<span onclick="vote(this,' + x.index + ',' + x.uid
                                                                                  + ',\'up\')"><img src="' + chrome.extension.getURL('/upvote.png')
                                                              + '" style="filter:grayscale(100%)" class="uparrow"  /></span><br><span class="votes">'
                                                              + x.votes + '</span><br><span onclick="vote(this,' + x.index + ',' + x.uid
                                                              + ',\'down\')"><img src="' + chrome.extension.getURL('/downvote.png')
                                                              + '" style="filter:grayscale(100%)" class="downarrow"  /></span>'

            //console.log(value);
        }
    }
}
