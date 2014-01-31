/*jslint node: true, indent: 2, white: true, vars: true */
/*globals suite, test, setup, suiteSetup, suiteTeardown, done, teardown, beforeEach */
'use strict';

var assert = require('assert');
var mongoose = require('mongoose');
var should = require('should');

var app = require('../app');
var settings = require('../settings');
var Response = require('../lib/models/Response');

// connect to mongoose
console.log("Connecting to mongo with settings", settings.mongo);
mongoose.connect(settings.mongo);

var setup = function(done) {
  console.log("starting setup");
  var responses = [
    {
      // Normal response
      survey: '1',
      responses: {
        chicago_311: 'Waiting to submit ticket'
      }
    },
    {
      // Normal response for second survey
      survey: '2',
      responses: {
        chicago_311: 'Waiting to submit ticket'
      }
    },
    {
      // Normal response for third survey
      survey: '3',
      responses: {
        chicago_311: 'Waiting to submit ticket'
      }
    },
    {
      // In-progress response for first survey
      survey: '1',
      responses: {
        chicago_311: 'Submitting',
        chicago_311_token: '--token--'
      }
    },
    {
      // Finished response for first survey
      survey: '1',
      responses: {
        chicago_311_tracker: '--tracking id--'
      }
    }
  ];

  Response.remove({}, function(err) {
    console.log("Removed responses");
    Response.create(responses, function(error) {
      console.log("Setup complete");
      done();
    });
  });
};

suite('311 app', function () {
  beforeEach(function(done){
    setup(done);
  });

  test('A response with a chicago_311 field should be processed', function (done) {
    false.should.not.be(true);
    done();
    // Run the app
  });

  test('The app should update just the given surveys', function (done) {
    // Check the app
    Response.find({survey: '3'}, function(error, docs) {
      docs[0].responses.chicago_311_tracker.should.be('Waiting to submit');
    });
  });

  test('The app should change the status to "Submitting" after the submission has started', function (done) {
    // run the app
    // count the number of responses
  });

  test('The app should not select responses that are not marked "Waiting to submit"', function (done) {
    // Run app.
    // Check for responses.
    // Make sure there aren't any that shouldn't be processed.
  });

  test('The app should update the response when the 311 ticket is received', function (done) {
    // Run app
    // Look or in-process responses
    // Pretend they have been resolved (override the checker)
    // Run mongoose query for responses.
  });
});
