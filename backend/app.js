var express = require('express');
var app = express();
var database = require('./database');
var bodyParser = require('body-parser');
var request = require('request');
var extractor = require('unfluff');
var keywordParser = require('./tfidf')
var https = require('https');
var fs = require('fs');

https.createServer({
    key: fs.readFileSync('../../privkey.pem'),
    cert: fs.readFileSync('../../cert.pem')
}, app).listen(8443);
// var fs = require('fs')
// var https = require('https')
//
// var ports = process.env.NODE_ENV === 'production'
//   ? [80, 443]
//   : [3442, 3443]
//
// var app = express()
//
// var server = https.createServer(
//   {
//     key: fs.readFileSync('./tls/key.pem'),
//     cert: fs.readFileSync('./tls/cert.pem')
//   },
//   app
// )

// server.listen(ports[1])
// app.listen(ports[0])

console.log("\n\n\n\n\n\n\n\n");
console.log("New session started");
console.log(new Date().toString().substring(0, 24));

app.use(bodyParser.json({
    type: 'application/json'
})); // for parsing application/json
app.use(bodyParser.text({
    type: 'text/html'
}));
app.use(bodyParser.text({
    type: 'text/plain'
}));
app.use(bodyParser.text({
    type: ''
}));

console.log(request.get('https://www.google.com').body);

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'https://www.google.com');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}
app.use(allowCrossDomain);


app.get('/', function(req, res) {
    res.send('Hello World!');
});

app.get('/vote/:uid/:dir', function(req, res, next) {
    var uid = req.params.uid;
    var dir = req.params.dir; //must be up or down
    var rtn = {};
    rtn.uid = uid;
    rtn.dir = dir;
    rtn.ready = false;

    do {
        if (dir != 'up' && dir != 'down') {
            rtn.error = {
                code: 1002,
                message: 'format must be "/vote/{uid}/{dir}" where dir="up"|"down"'
            }
            break;
        }
        console.log('vote', uid, dir);

        function firstquery(err, result, fields) {
            rtn.db_result = result;
            if (err)
                rtn.error = err;
            if (result.changedRows < 1) {
                rtn.error = {
                    code: 1001,
                    message: 'failed to update votes!'
                }
                console.log("/vote/" + uid + "/" + dir + " - ", result);
            }
            rtn.ready = true;
            res.json(rtn);
        }
        database.query('UPDATE `urls` set `votes` = `votes` ' + (dir == 'up' ? '+' : '-') + ' 1 WHERE `uid` = ?;', [uid], firstquery);
    } while (false);


});

app.post('/geturl', function(req, res, next) {
    var rtn = {};
    var data = req.body;
    rtn.req = {};
    rtn.req.ip = req.ip;
    rtn.req.cmd = 'geturl';
    rtn.ready = false;
    rtn.req.data = data;


    function firstquery(err, rows, fields) {
        console.log(arguments);
        if (err)
            throw err;
        if (rows == undefined || rows.length == 0) {
            database.query("INSERT INTO `urls` (`uid`, `url`, `votes`) VALUES (NULL, ?, '0');", [data.url.substring(0, 80)], secondquery);
            return;
        }
        rtn.data = rows;
        rtn.data[0].uid = Number(rtn.data[0].uid);
        res.json(rtn);
    }

    function secondquery(err, rows, fields) {
        if (err)
            throw err;
        database.query('SELECT * FROM `urls` WHERE `url` = ?', [data.url.substring(0, 80)], firstquery);
    }
    if (data.url == undefined)
        return;

    database.query('SELECT * FROM `urls` WHERE `url` = ?', [data.url.substring(0, 80)], firstquery);

});

app.post('/keywords', function(req, res, next) {
    var data = req.body;
    data.size = data.urls.length;
    data.parsed = [];

    function getResponse(error, response, html) {
        if (error) {
            console.log(error);
            html = "blank"
        }
        var t = extractor(html).text;
        data.parsed.push(t);
        console.log(t);
        console.log(data.parsed.length)
        if (data.parsed.length == data.size) {
            //do the keyword parsing
            var d = keywordParser.searchPages(data.parsed);
            console.log(d);
            res.json({
                keywords: d
            });
        }

    }
    for (var i = 0; i < data.size; i++)
        request({
            method: 'GET',
            uri: data.urls[i]
        }, getResponse);
});

// app.listen(3000, function() {
//     console.log('Example app listening on port 3000!');
// });

// var idf = require('./tfidf');
// idf.searchPage();
