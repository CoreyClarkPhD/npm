var config = {
	"options" : {
		  "host": "localhost",
		  "port":"9000"
	},
	"auth":{
		"kazi-token":"YOUR-SECRET-TOKEN"
	}
}
var bigInt = require('big-integer');
var request=require('request');
var uuid = require('node-uuid');
var util = require('util');
var redis = require('redis');
var clientRedisToGo = redis.createClient(9447,
                            'tetra.redistogo.com',
                            {no_ready_check: true});

function computes(operation, data){

// clientRedisToGo.auth('3d4384d62c0d021388fe78192f0d8efa', function() {
  // console.log('Redis client connected');

    var jobs=[]
    var jobid = uuid.v1()
    jobs.push(
    	{
    		priority:'normal',
    		id: 'computes:' + jobid,
    		name:'computes',
    		data:{
    			operation: operation,
    			data: data
    		},
    		ttl: 60000, // (3*60*1000*60), //3hours
    		reschedule_after: (10*1000*60), //10 mins
    		delay:0 //execute immediately			ttl: (1000*60*5), //5 mins
    	}
    );


  	// var jobsReceived = [];
    // clientRedisToGo.on('message', function (job, result) {
    //   console.log('message received:', job, result);
    //
    //   // multiple job results are being returned due to no lock on redis
    //   if (jobsReceived.indexOf(job) == -1){
    //     jobsReceived.push(job);
    //
    //     var resultData = JSON.parse(result);
    //     console.log('results:', resultsNoLeadingZeros);
    //
    //     // exit when all results are returned
    //     if (jobs.length == jobsReceived.length)
    //       process.exit();
    //
    //   }
    // });

  	//we are posting jobs and every call to the server must also contain client.name
  	var payload={
  		client:{ "name": "job-creator" },
  		jobs:jobs
  	};

  	//Compose post with jobs + client payload
  	var post={
  		url: util.format('http://%s:%s/jobs/queueJobs',config.options.host,config.options.port),
  		form: payload,
  		//include authentication headers from the config
  		headers:config.auth
  	}

  	//Now Post JOB
  	request.post(post, function(err,httpResponse,body){

  		var JSON_response=JSON.parse(body);

  		console.log(JSON.stringify(JSON_response,0,4));

  	});
  // });
};

module.exports = computes;
