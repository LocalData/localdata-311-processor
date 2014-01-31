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
      },
      geo_info: {
        centroid: [41.51,-87.38],
        humanReadableName: '1700 Cermak'
      }
    },
    {
      // Normal response for second survey
      survey: '2',
      responses: {
        chicago_311: 'Waiting to submit ticket'
      },
      geo_info: {
        centroid: [41.51,-87.38],
        humanReadableName: '1701 Cermak'
      }
    },
    {
      // Normal response for third survey
      survey: '3',
      responses: {
        chicago_311: 'Waiting to submit ticket'
      },
      geo_info: {
        centroid: [41.51,-87.38],
        humanReadableName: '1702 Cermak'
      }
    },
    {
      // Response with no chicago_311 trigger
      survey: '1',
      responses: {
        foo: 'bar'
      },
      geo_info: {
        centroid: [41.51,-87.38],
        humanReadableName: '1703 Cermak'
      }
    },
    {
      // In-progress response for first survey
      survey: '1',
      responses: {
        chicago_311: 'Submitting',
        chicago_311_token: '--token--'
      },
      geo_info: {
        centroid: [41.51,-87.38],
        humanReadableName: '1704 Cermak'
      }
    },
    {
      // Finished response for first survey
      survey: '1',
      responses: {
        chicago_311_tracker: '--tracking id--'
      },
      geo_info: {
        centroid: [41.51,-87.38]
      },
      humanReadableName: '1705 Cermak'
    }
  ];

  Response.remove({}, function(err) {
    console.log("Removed responses");
    Response.create(responses[0], function(error) {
      console.log("Setup complete");
      done();
    });
  });
};

suite('311 app', function () {
  beforeEach(function(done){
    setup(done);
  });

  test('Responses with a chicago_311 field should be processed', function (done) {
    app.processNewResponses(function(error) {
      should.not.exist(error);
      Response.find({}, function(error, docs) {
        console.log();
        done();
      });
    });
  });

  test('The app should update just the given surveys', function (done) {
    // Check the app
    Response.find({}, function(error, docs) {
      should.not.exist(error);
      docs[0].responses.chicago_311_tracker.should.be('Waiting to submit');
      done();
    });
  });

  test('The app should not select responses that are not marked "Waiting to submit"', function (done) {
    // Run app.
    // Check for responses.
    // Make sure there aren't any that shouldn't be processed.
    should.exist(undefined);
    done();
  });

  test('The app should update the response when the 311 ticket is received', function (done) {
    // Run app
    // Look or in-process responses
    // Pretend they have been resolved (override the checker)
    // Run mongoose query for responses.
    should.exist(undefined);
    done();
  });
});
