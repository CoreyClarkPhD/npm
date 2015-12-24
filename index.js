var computes = require('./lib/computes');

module.exports = {
  compute: function (operation, data){
    return new computes(operation, data);
  }
}
