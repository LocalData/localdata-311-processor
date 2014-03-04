/*jslint node: true, indent: 2, white: true, vars: true */
/*globals suite, test, setup, suiteSetup, suiteTeardown, done, teardown, beforeEach */
'use strict';

var mongoose = require('mongoose');
var should = require('should');

var app = require('../app');
var settings = require('../settings');
var Response = require('../lib/models/Response');

// connect to mongoose
console.log("Connecting to mongo with settings", settings.mongo);
mongoose.connect(settings.mongo, { safe: true });


/**
 * Returns a random longitude
 * We need to do this or the endpoint will complain about duplicate entries.
 */
var getRandomLongitude = function() {
  var min = 0;
  var max = 100000;
  return '-87.38' + Math.floor(Math.random() * (max - min + 1)) + min;
};

// Override the survey settings
settings.surveys = ['1', '2'];

/**
 * Set up for our tests
 */
var setup = function(done) {
  console.log("Starting setup");
  var responses = [
    {
      // Normal response
      survey: '1',
      responses: {
        chicago_311: 'Waiting to submit ticket'
      },
      geo_info: {
        centroid: [41.51, getRandomLongitude()],
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
        centroid: [41.51, getRandomLongitude()],
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
        centroid: [41.51, getRandomLongitude()],
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
        centroid: [41.51, getRandomLongitude()],
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
        centroid: [41.51, getRandomLongitude()],
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
        centroid: [41.51, getRandomLongitude()]
      },
      humanReadableName: '1705 Cermak'
    }
  ];

  Response.remove({}, function(err) {
    console.info("Removed old responses");
    Response.create(responses, function(error) {
      console.info("Test setup complete");
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
      Response.find({
       'responses.chicago_311': 'Submitting'
      }, function(error, docs) {
        should.not.exist(error);
        docs.should.not.be.empty;
        docs[0].responses.should.have.property('chicago_311_token');
        done();
      });
    });
  });

  test('The app should only update the surveys specified in the settings', function (done) {
    // Check the app
    app.processNewResponses(function(error) {
      should.not.exist(error);
      Response.find({
        survey: { $nin: settings.surveys }
      }, function(error, docs) {
        console.log("Found docs", docs);
        should.not.exist(error);
        docs.should.not.be.empty;
        docs[0].responses.chicago_311.should.equal('Waiting to submit ticket');
        done();
      });
    });
  });

  test('The app should not update responses without a chicago_311 tag', function (done) {
    // Run app.
    // Check for responses.
    // Make sure there aren't any that shouldn't be processed.
    app.processNewResponses(function(error) {
      should.not.exist(error);
      Response.find({
        'responses.foo': 'bar'
      }, function(error, docs) {
        // console.log("Found docs", docs);
        should.not.exist(error);
        docs.should.be.empty;
        done();
      });
    });

    done();
  });

  // test('The app should update the response when the 311 ticket is received', function (done) {
  //   app.processNewResponses(function(error) {
  //     should.not.exist(error);
  //     console.log("Done processing new responses");
  //     app.processInProgressResponses(function(error) {
  //       should.not.exist(error);
  //       // Further tests possible but difficult -- need to mock or spy
  //       // Often tokens don't become requests fast enough for us to find out.
  //     });
  //   });
  // });
});
