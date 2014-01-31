/*jslint node: true */
'use strict';

var settings = module.exports;

// MongoDB
settings.mongo = process.env.MONGO;

// Chicago keys
settings.chicago_key = process.env.CHICAGO_KEY;
settings.chicago_endpoint = process.env.CHICAGO_ENDPOINT;

settings.surveys = process.env.SURVEY_IDS.split(',');
