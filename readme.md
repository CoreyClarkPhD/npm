# Computes NPM Module

This example computes 9000! across 3 cores.

```javascript
var computes = require("computes");
var bigInt = require("big-integer");

var operation = "(function(data) { var result=1;for (var i = data*3000+1; i <= data*3000+3000; ++i){result = bigInt(result).multiply(i).toString();}return result; })";

var job = computes.connect();

job.on("ready", function (){
  for(var data = 0; data < 3; data++) {
    job.compute(operation, data);
  }
});

var jobCount = 0
job.on("result", function (result){
  jobCount++;
  console.log(result);
  // if found then job.cancel(job);
  if (jobCount == 3){
    job.disconnect();
  }
});
```

Note: operation can also be a URL such as a raw gist i.e. [https://gist.githubusercontent.com/computes/df86808c4a9d0a0d489a/raw/11c92b86662a4df5b5db585a1442796333bd1934/test.js](https://gist.githubusercontent.com/computes/df86808c4a9d0a0d489a/raw/11c92b86662a4df5b5db585a1442796333bd1934/test.js)

API commands include:

- connect
- compute
- disconnect
- execute

coming soon...

- cancel
