// var computes = require('./lib/computes');
//
// module.exports = {
//   compute: function (operation, data){
//     return new computes(operation, data);
//   }
// }

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

var Job = function(){};
util.inherits( Job, EventEmitter );

var jobsReceived = [];

function submitJob(payload){
  var post={
		url: util.format('http://%s:%s/jobs/compute',config.options.host,config.options.port),
		form: payload,
		headers:config.auth
	}

	request.post(post, function(err,httpResponse,body){
		return body;
	});
}

function connect(){
  var job =  new Job();

  clientRedisToGo.auth(config.redis.password, function() {
    console.log('> connected');
    job.emit("ready");
  });

  clientRedisToGo.on('message', function (jobx, data) {

    if (jobsReceived.indexOf(jobx) == -1){
      jobsReceived.push(jobx);

      clientRedisToGo.unsubscribe(jobx);
      // console.log('unsubscribed from', job);

      result = JSON.parse(data)
      var results = {
        job: jobx,
        result: result.result
      }

      job.emit( "result", results );
    }
  });

  return job;
}

Job.prototype.cancel = function(){};

Job.prototype.disconnect = function(){
  clientRedisToGo.quit();
};

Job.prototype.compute = function compute(operation, data){

  var jobid = 'computes:' + uuid.v1();
	clientRedisToGo.subscribe(jobid);
	// console.log('subscribed to', jobid)

  var payload={
    client: { "name": "job-creator" },
		jobid: jobid,
    operation: operation,
    data: data
  };

  submitJob(payload);

}

Job.prototype.execute = function execute(command){

  var jobid = 'computes:' + uuid.v1();
	clientRedisToGo.subscribe(jobid);
	// console.log('subscribed to', jobid)

  var payload={
    client: { "name": "job-creator" },
		jobid: jobid,
    command: command
  };

  submitJob(payload);

}

module.exports = {
  connect: connect
}
