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

clientRedisToGo.on("error", function (err) {
  console.log("error encountered", err);
});

clientRedisToGo.on("end", function() {
  console.log("> disconnected");
});

var jobsReceived = [];
var initiated = false;

var Job = function(){};
util.inherits( Job, EventEmitter );

function connect(){
  var job =  new Job();
  clientRedisToGo.auth(config.redis.password, function() {
    console.log('> connected');
    job.emit("ready");
  });
  return job;
}

Job.prototype.cancel = function(){};

Job.prototype.close = function(){
  clientRedisToGo.quit();
};

Job.prototype.compute = function compute(operation, data){

  var self = this;

  clientRedisToGo.on('message', function (job, data) {

    if (jobsReceived.indexOf(job) == -1){
      jobsReceived.push(job);

      clientRedisToGo.unsubscribe(job);
      // console.log('unsubscribed from', job);

      result = JSON.parse(data)
      var results = {
        job: job,
        result: result.result
      }
    	self.emit( "result", results );
    }

  });

  var jobid = 'computes:' + uuid.v1();
	clientRedisToGo.subscribe(jobid);
	// console.log('subscribed to', jobid)

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

}

module.exports = {
  connect: connect
}
