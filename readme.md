# Computes.io NPM Module

This example computes 9000! across 3 cores.

```javascript
var computes = require("computes");
var bigInt = require("big-integer");

var operation = "(function(data) { var result=1;for (var i = data*3000+1; i <= data*3000+3000; ++i){result = bigInt(result).multiply(i).toString();}return result; })";

for(var x = 0; x < 3; x++) {
  computes.compute(operation, x);
}

computes.on("result", function (job, result){
  console.log(result);
});
```

Note: operation can also be a URL such as a raw gist i.e. [https://gist.githubusercontent.com/computes/df86808c4a9d0a0d489a/raw/11c92b86662a4df5b5db585a1442796333bd1934/test.js](https://gist.githubusercontent.com/computes/df86808c4a9d0a0d489a/raw/11c92b86662a4df5b5db585a1442796333bd1934/test.js)
