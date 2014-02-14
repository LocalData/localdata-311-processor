/*jslint node: true */
'use strict';

/**
Small server for sending LocalData responses to 311.
Expects responses to have a chicago_311 property of 'Waiting to submit ticket'
*/

var async = require('async');
var http = require('http');
var express = require('express');
var mongoose = require('mongoose');
var request = require('request');

var settings = require('./settings');
var Response = require('./lib/models/Response');

var NEW = 'Waiting to submit ticket';
var IN_PROGRESS = 'Submitting';
var FAILED = 'Unable to submit ticket';
var DESCRIPTION = 'This house appears to be vacant.';

var BUILDING_VIOLATION_TYPE = 'Building violation';
var BUILDING_VIOLATION_CODE = '4fd3bd72e750846c530000cd';
var REQUEST_ENDPOINT = settings.chicago_endpoint + 'requests.json?api_key='
  + settings.chicago_key;


/**
DEV NOTES:

API Docs:
http://dev.cityofchicago.org/docs/api/service_definition

To post a request:
http://dev.cityofchicago.org/docs/api/post_service_request

Service IDs:
Building violations: 4fd3bd72e750846c530000cd
Street light out: 4ffa9f2d6018277d400000c8
*/

var app = {};

/*
  Handle errors
*/
app.error = function(error) {
  console.error(error);
};

/*
  Process an individual new repsonse
*/
app.processNewResponse = function(item, done) {
  var details = {
    form: {
      lat: item.geo_info.centroid[0],
      long: item.geo_info.centroid[1],
      address_string: item.geo_info.humanReadableName, // address
      description: DESCRIPTION,
      service_code: BUILDING_VIOLATION_CODE
    }
  };

  // TODO: actually uses 311 endpoint
  request.post(REQUEST_ENDPOINT, details, function(error, response, body) {
    console.log("311 API response: ", error, body);
    if(error) {
      done(error);
      return;
    }

    body = JSON.parse(body);
    if (response.statusCode === 400) {
      done(body);
      return;
    }

    // console.log("setting token and in progress", body[0].token);
    item.responses.chicago_311_token = body[0].token;
    item.responses.chicago_311 = IN_PROGRESS;
    item.markModified('responses');

    item.save(function(error, doc) {
      done(error);
    });
  });
};


/*
  Get all the new 311 responses and process them
*/
app.processNewResponses = function(done) {
  var q = {
    survey: { $in: settings.surveys }, // TODO use x in List query
    'responses.chicago_311': NEW
  };

  var query = Response.find(q);
  query.exec(function(error, items) {
    if (error) {
      done(error);
      return;
    }

    async.eachLimit(items, 1, app.processNewResponse, function(error) {
      done(error);
    });
  });
};


app.processInProgressResponse = function(item, done) {
  // look for the ID on srtracker
  // "it is nesseary to poll the GET service_request_id method until an SR id is
  //    returned"
  // tokens/:token_id.:format
  var token = item.responses.chicago_311_token;
  var url = settings.chicago_endpoint + 'tokens/' + token + '.json';
  console.log("Getting with URL", url);
  request.get(url, function(error, response, body) {
    if (error) {
      return done(error);
    }

    console.log(body);
    // If there is an ID, save it to the object
    item.responses.chicago_311 = '1234';
    delete item.responses.chicago_311_token;
    item.save();
    done();
  });
};

/*
  Process in-progress 311 submissions
  Check the API to see if it has recieved a tracking ID instead of the token
*/
app.processInProgressResponses = function(done) {
  var q = {
    survey: { $in: settings.surveys }, // TODO use x in List query
    'responses.chicago_311': IN_PROGRESS
  };

  var query = Response.find(q);
  query.exec(function(error, items) {
    if (error) {
      done(error);
      return;
    }

    console.log("I found in-progress responses:", items);

    async.eachLimit(items, 1, app.processInProgressResponse, function(error) {
      done(error);
    });
  });
};

app.noop = function() {

};

app.run = function(done, res) {
  console.log("Starting the app");
  mongoose.connect(settings.mongo, { safe: true });

  async.series([
    app.processNewResponses,
    app.processInProgressResponses
  ], function(error) {
    done(error);
  }.bind(this));
};

var server = express();
server.get('/', function(req, res){
  console.log("Listening on port", process.env.port || 3000);
  app.run(function() {
    console.log("Done");
    res.send(200);
  });
});
server.listen(process.env.port || 3000);

module.exports = app;
