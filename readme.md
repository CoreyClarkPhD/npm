
# Computes NPM Module

This example computes 9000! across 3 cores.

```javascript
var computes = require("computes");
var bigInt = require("big-integer");

var operation = "(function(data) { var result=1;for (var i = data*3000+1; i <= data*3000+3000; ++i){result = bigInt(result).multiply(i).toString();}return result; })";

// var operation = "https://gist.githubusercontent.com/computes/df86808c4a9d0a0d489a/raw/11c92b86662a4df5b5db585a1442796333bd1934/test.js";

// Set options
var options = {
  domain: "domain_key_from_computes.io",
  priority: "normal",  //'low', 'normal' & 'high'
  ttl: 60000,  // milliseconds
  delay: 0 //milliseconds
};

// Connect kernel to computes
var job = computes.connect(options.domain);

job.on("ready", function (){
  // Update memory object
  job.memory({"counter":0});

  // Submit operations
  for(var data = 0; data < 3; data++) {
    job.compute(operation, data, options);
  }
});

var jobCount = 0
// Fired as cores return results
job.on("result", function (result){
  console.log(result);
  jobCount++;
  if (jobCount == 3){
    job.disconnect();
  }
});

// Fired by webhooks or messages from cores etc.
job.on("message", function (message){
  console.log(message);
});

// Fired when memory changes by kernel or cores
job.on("memory", function (ram){
  console.log("npm", ram);
});

```

Notes:

1. Options are optional
2. Operation can also be a URL such as a raw gist i.e. [https://gist.githubusercontent.com/computes/df86808c4a9d0a0d489a/raw/11c92b86662a4df5b5db585a1442796333bd1934/test.js](https://gist.githubusercontent.com/computes/df86808c4a9d0a0d489a/raw/11c92b86662a4df5b5db585a1442796333bd1934/test.js)

API commands include:

- connect
- disconnect
- compute
- execute
- cancel
- message
- memory
