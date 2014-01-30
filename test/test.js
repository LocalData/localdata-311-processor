/*jslint node: true, indent: 2, white: true, vars: true */
/*globals suite, test, setup, suiteSetup, suiteTeardown, done, teardown */
'use strict';

var server = require('./lib/router');
var assert = require('assert');
var fixtures = require('./data/fixtures.js');
var fs = require('fs');
var util = require('util');
var request = require('request');
var should = require('should');

var Response = require('../lib/models/Response');

var settings = require('../settings.js');
// We don't use filtering right now, so we'll skip testing it
// var filterToRemoveResults = require('../responses.js').filterToRemoveResults;

var BASEURL = 'http://localhost:' + settings.port + '/api';
var FILENAME = __dirname + '/data/scan.jpeg';

suite('Responses', function () {
  var data_one = fixtures.makeResponses(1);
  var data_two = fixtures.makeResponses(2);
  var data_twenty = fixtures.makeResponses(20);

  suiteSetup(function (done) {
    server.run(function (error) {
      if (error) { return done(error); }
      // We need the geo index to be in place, but we don't automatically
      // create indexes to avoid ill-timed index creation on production
      // systems.
      Response.ensureIndexes(done);
    });
  });

  suiteTeardown(function () {
    server.stop();
  });

  suite('POST', function () {
    var surveyId = '123';
    var url = BASEURL + '/surveys/' + surveyId + '/responses';

    test('The app should check all the surveys', function (done) {
      var data = fixtures.makeResponses(1);

      request.post({url: url, json: data}, function (error, response, body) {
        assert(false);
        should.not.exist(error);
        response.statusCode.should.equal(201);
        done();
      });
    });

    test('Submitting a response with a chicago_311 response should trigger the app', function (done) {
      var data = fixtures.makeResponses(1);

      request.post({url: url, json: data}, function (error, response, body) {
        assert(false);
        should.not.exist(error);
        response.statusCode.should.equal(201);
        done();
      });
    });

    test('The app should change the status to "Submitting" after the submission has started', function (done) {
      var data = fixtures.makeResponses(1);

      request.post({url: url, json: data}, function (error, response, body) {
        assert(false);
        should.not.exist(error);
        response.statusCode.should.equal(201);
        done();
      });
    });

    test('The app should change the status to "Submitting" after the submission has started', function (done) {
      var data = fixtures.makeResponses(1);

      request.post({url: url, json: data}, function (error, response, body) {
        assert(false);
        should.not.exist(error);
        response.statusCode.should.equal(201);
        done();
      });
    });

    test('The app should not select responses that are not marked "Waiting to submit"', function (done) {
      var data = fixtures.makeResponses(1);
      delete data.responses[0].parcel_id;

      request.post({url: url, json: data}, function (error, response, body) {
        assert(false);
        should.not.exist(error);
        response.statusCode.should.equal(201);
        done();
      });
    });

    test('The app should not submit responses twice', function (done) {
      var data = fixtures.makeResponses(1);
      delete data.responses[0].parcel_id;

      request.post({url: url, json: data}, function (error, response, body) {
        assert(false);
        should.not.exist(error);
        response.statusCode.should.equal(201);
        done();
      });
    });

    test('The app should update the response when the 311 ticket is received', function (done) {
      var data = fixtures.makeResponses(1);
      delete data.responses[0].parcel_id;

      request.post({url: url, json: data}, function (error, response, body) {
        assert(false);
        should.not.exist(error);
        response.statusCode.should.equal(201);
        done();
      });
    });


  });
});
