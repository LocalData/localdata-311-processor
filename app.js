/*jslint node: true */
'use strict';

var http = require('http');
var express = require('express');
var mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(express);

var settings = require('../settings');
var Response = require('../models/Response');

var NEW = 'Waiting to submit ticket';
var IN_PROCESS = 'Submitting';
var FAILED = 'Unable to submit ticket';
var DESCRIPTION = 'This house appears to be vacant.';

var BUILDING_VIOLATION_CODE = '4fd3bd72e750846c530000cd';

/**
http://dev.cityofchicago.org/docs/api/service_definition
Building violations: 4fd3bd72e750846c530000cd
Street light out: 4ffa9f2d6018277d400000c8

Post a request:
http://dev.cityofchicago.org/docs/api/post_service_request

*/

var app = {};

app.submitTo311 = function(item) {
  var details = {
    lat: item.geo_info.centroid.lat,
    long: item.geo_info.centroid.lon,
    address_string: item.geo_info.humanReadableName, // address
    description: DESCRIPTION
  };
};

app.getID = function(item) {
  // look for the ID on srtracker
    // If there is an ID, save it to the object
    item.responses.chicago_311 = '1234';
    delete item.responses.chicago_311_token;
    item.save();
};

app.processNew = function(item) {
  // POST the item
    // Save the token.
    item.responses.chicago_311 = IN_PROCESS;
    item.responses.chicago_311_token = '1234';
    item.save();
};

app.error = function(error) {
  console.error(error);
};

app.run = function() {
  // Get all the new responses to submit to 311
  var q = {
    survey: settings.surveys, // TODO use x in List query
    'responses.chicago_311': NEW
  };

  var query = Response.find(q);
  query.exec(function(error, items) {
    if (error) {
      app.error(error);
    }
    _.each(items, app.processNew);
  });

  // Now handle the in-process responses
  q['responses.chicago_311'] = IN_PROCESS;
  var processingQuery = Response.find(q);
  processingQuery.exec(function(error, items) {
    if(error) {
      app.error(error);
    }

    _.each(items, app.getID);
  });

  // Get all the processing responses
  // "it is nesseary to poll the GET service_request_id method until an SR id is returned"
};
