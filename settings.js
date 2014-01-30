/*jslint node: true */
'use strict';

var settings = module.exports;

// MongoDB
settings.mongo_host = process.env.MONGO_HOST || 'localhost';
settings.mongo_port = parseInt(process.env.MONGO_PORT, 10);
if (isNaN(settings.mongo_port)) { settings.mongo_port = 27017; }
settings.mongo_db = process.env.MONGO_DB || 'scratchdb';
settings.mongo_user = process.env.MONGO_USER;
settings.mongo_password = process.env.MONGO_PASSWORD;
settings.mongo_native_parser = false;
if (process.env.MONGO_NATIVE_PARSER !== undefined && process.env.MONGO_NATIVE_PARSER.toLowerCase() === 'true') {
  settings.mongo_native_parser = true;
}

// Chicago keys
settings.aws_key = process.env.AWS_KEY;
settings.aws_secret = process.env.AWS_SECRET;

settings.survey_id = process.env.SURVEY_ID;
