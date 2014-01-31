/*jslint node: true, indent: 2, white: true, vars: true */
/*globals suite, test, setup, suiteSetup, suiteTeardown, done, teardown */
'use strict';

var assert = require('assert');
var should = require('should');

var app = require('../app');
var settings = require('../settings');
var Response = require('../models/Response');

// connect to mongoose


var setup = function(done) {
  // remove existing responses
    // create responses
      // Save them to the DB
      Response.save(responses, function() { done(); });
}

suite('Responses', function () {
  beforeEach(function(done){
    setup(done);
    // clear the collection
    // add data
  });

  suite('311 app', function () {
    test('The app should check just the given surveys', function (done) {
      var data = fixtures.makeResponses(1);

      request.post({url: url, json: data}, function (error, response, body) {
        assert(false);
        should.not.exist(error);
        response.statusCode.should.equal(201);
        done();
      });
    });

    test('A response with a chicago_311 field should be processed', function (done) {
      var data = fixtures.makeResponses(1);

      request.post({url: url, json: data}, function (error, response, body) {
        assert(false);
        should.not.exist(error);
        response.statusCode.should.equal(201);
        done();
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
});
