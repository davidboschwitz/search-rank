module.exports = {};


module.exports.init = function(){
  data = {};
  this.data = data;
}

module.exports.add = function(key, value){
  data[key] = value;
  console.log(data);
}

module.exports.get = function(){
  return data;
}
