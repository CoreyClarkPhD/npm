// var computes = require('./lib/computes');
//
// module.exports = {
//   compute: function (operation, data){
//     return new computes(operation, data);
//   }
// }

// http://blog.teamtreehouse.com/build-npm-package
var config = require('./config.json');
var bigInt = require('big-integer');
var request=require('request');
var util=require('util');
var uuid = require('node-uuid');
var EventEmitter = require( "events" ).EventEmitter;

var redis = require('redis');
var clientRedisToGo = redis.createClient(config.redis.port,
                            config.redis.host,
                            {no_ready_check: true});

// clientRedisToGo.auth(config.redis.user, function() {
//   console.log('Redis connected');
// });

clientRedisToGo.on("error", function (err) {
  console.log("Redis error encountered", err);
});

clientRedisToGo.on("end", function() {
  console.log("Redis connection closed");
});

// clientRedisToGo.on('message', function (job, result) {
//   console.log('message received:', job, result);
// 	controller.emit( "result", result );
// });

var jobsReceived = [];
var initiated = false;

function compute(operation, data){

  EventEmitter.call(this);
  computesEmitter = this;

  if (initiated == false){
    initiated = true;
    console.log('connecting to computes...')
    clientRedisToGo.auth(config.redis.password, function() {
      console.log('connected!');
      computesEmitter.emit("ready");
    });
  };

  clientRedisToGo.on('message', function (job, data) {

    if (jobsReceived.indexOf(job) == -1){
      jobsReceived.push(job);

      result = JSON.parse(data)
      var results = {
        job: job,
        result: result.result
      }
    	computesEmitter.emit( "result", results );
    }

  });


  var jobid = 'computes:' + uuid.v1();
	clientRedisToGo.subscribe(jobid);
	console.log('subscribed to', jobid)

  var payload={
    client: { "name": "job-creator" },
		jobid: jobid,
    operation: operation,
    data: data
  };

	var post={
		url: util.format('http://%s:%s/jobs/compute',config.options.host,config.options.port),
		form: payload,
		headers:config.auth
	}

	request.post(post, function(err,httpResponse,body){
		return body;
	});

};

util.inherits( compute, EventEmitter );
module.exports = compute;
