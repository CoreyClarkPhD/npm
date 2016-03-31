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
var io = require('socket.io-client');
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

function submitJob(endpoint, payload){
  var post={
		url: util.format('http://%s:%s/jobs/' + endpoint,config.options.host,config.options.port),
		form: payload,
		headers:config.auth
	}

	request.post(post, function(err,httpResponse,body){
		return body;
	});
}

function connect(domainKey){
  var job =  new Job();
  console.log("domain", domainKey);

  // Connect to supercomputer via websockets
  var socket = io.connect('http://'+config.options.host+':'+config.options.port, {reconnect: true});
  socket.on('connect', function () {

    if (domainKey){
      socket.emit('storeClientInfo', { customId: domainKey });
    }

    socket.on('message', function (msg) {
      // console.log('Message received: ', msg);
      job.emit("message", msg);
    });

  });

  clientRedisToGo.auth(config.redis.password, function() {
    job.emit("ready");
  });

  clientRedisToGo.on('message', function (jobx, data) {

    if (jobsReceived.indexOf(jobx) == -1){
      jobsReceived.push(jobx);

      clientRedisToGo.unsubscribe(jobx);
      // console.log('unsubscribed from', job);
      // clientRedisToGo.del(jobx);

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
  socket.close();
};

Job.prototype.compute = function compute(operation, data, options){

  var jobid = 'computes:' + uuid.v1();
	clientRedisToGo.subscribe(jobid);
	// console.log('subscribed to', jobid)

  var payload={
    client: { "name": "job-creator" },
		jobid: jobid,
    operation: operation,
    data: data,
    options: options
  };

  submitJob('compute', payload);

}

Job.prototype.execute = function execute(command, options){

  var jobid = 'computes:' + uuid.v1();
	clientRedisToGo.subscribe(jobid);
	// console.log('subscribed to', jobid)

  var payload={
    client: { "name": "job-creator" },
		jobid: jobid,
    command: command,
    options: options
  };

  submitJob('compute', payload);

}

Job.prototype.cancel = function cancel(job){

  var payload={
    client:{ "name": "job-creator" },
    jobs: [job]
  };

  submitJob('killJobs', payload);

}

module.exports = {
  connect: connect
}
