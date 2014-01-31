/*jslint node: true */
'use strict';

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

var http = require('http');
var express = require('express');
var mongoose = require('mongoose');
var request = require('request');

var settings = require('../settings');
var Response = require('../models/Response');

var NEW = 'Waiting to submit ticket';
var IN_PROCESS = 'Submitting';
var FAILED = 'Unable to submit ticket';
var DESCRIPTION = 'This house appears to be vacant.';

// TODO: In the future, responses will need a type to be handled correctly
var BUILDING_VIOLATION_TYPE = 'Building violation';
var BUILDING_VIOLATION_CODE = '4fd3bd72e750846c530000cd';

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
    lat: item.geo_info.centroid.lat,
    long: item.geo_info.centroid.lon,
    address_string: item.geo_info.humanReadableName, // address
    description: DESCRIPTION
  };

  var url = '';
  request.post(url, details, function(error, response, body) {
    if(error) {
      done(error);
      return;
    }

    var token = body.token;
    item.responses.chicago_311_token = token;
    item.responses.chicago_311 = IN_PROCESS;
    item.save();
    done();
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
      app.error(error);
      done(error);
    }

    _.each(items, app.processNewResponse);
    done();
  });
};


/*
  Process in-progress 311 submissions
  Check the API to see if it has recieved a tracking ID instead of the token
*/
app.processInProgressResponses = function(item) {
  // TODO in milestone 2
  // look for the ID on srtracker
  // "it is nesseary to poll the GET service_request_id method until an SR id is
  //    returned"
  // var token = item.responses.chicago_311_token;
  // request.get(url, function(error, response, body) {
  //   // If there is an ID, save it to the object
  //   item.responses.chicago_311 = '1234';
  //   delete item.responses.chicago_311_token;
  //   item.save();
  // });
};


app.run = function(done) {
  mongoose.connect();

  // Now handle the in-process responses
  q['responses.chicago_311'] = IN_PROCESS;
  var processingQuery = Response.find(q);
  processingQuery.exec(function(error, items) {
    if(error) {
      app.error(error);
    }

    _.each(items, app.getID);
  });
};
