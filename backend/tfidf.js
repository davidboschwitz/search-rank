module.exports = {};
var natural = require('natural'),
    TfIdf = natural.TfIdf;

function searchPages(data) {
    tfidf = new TfIdf();

    // tfidf.addDocument('this document is about ruby.');
    // tfidf.addDocument('this document is about node.');
    // tfidf.addDocument('this document is about ruby and node.');
    for (var i = 0; i < data.length; i++)
        tfidf.addDocument(data[i]);

    //it's possible to retrieve a list of all terms in a document, sorted by their importance.

    var rtn = [];
    var i = 0;



    for (i = 0; i < data.length; i++) {
      function eachthing(item) {
          if (!rtn[i])
              rtn[i] = [];
          rtn[i].push({
              term: item.term,
              rank: item.tfidf
          });
      }
        tfidf.listTerms(i).forEach(eachthing);
    }

    return rtn;
}

module.exports.searchPages = searchPages;
