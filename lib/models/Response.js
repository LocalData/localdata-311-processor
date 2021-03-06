/*jslint node: true */
'use strict';

var mongoose = require('mongoose');

function validateResponses (val) {
  return val !== undefined;
}

var responseSchema = new mongoose.Schema({
  // We don't use the native mongo ID when communicating with clients.
  _id: { type: mongoose.Schema.Types.ObjectId },
  __v: { type: Number, select: false },
  id: String,
  survey: String,
  source: {
    type: { type: String },
    collector: String,
    started: Date,
    finished: Date
  },
  created: Date,
  geo_info: {
    centroid: [Number],
    parcel_id: String,
    points: { type: [], select: false },
    geometry: {
      type: { type: String },
      coordinates: []
    },
    humanReadableName: String
  },
  files: [String],
  parcel_id: String,
  object_id: String,
  responses: {
    type: Object,
    validate: validateResponses
  }
}, {
  autoIndex: false
});

// Indexes

// Ensure we have a geo index on the centroid field.
// We always restrict based on survey ID, so we use a compound index.
responseSchema.index({ 'geo_info.centroid': '2d', survey: 1 });

// Index the survey ID + creation date, which we use to sort
// Descending
responseSchema.index({ survey: 1, created: 1 });
// Ascending
responseSchema.index({ survey: 1, created: -1 });

// Index the survey ID, which we use to look up sets of responses
responseSchema.index({ survey: 1 });

// Index the collector name
responseSchema.index({ survey: 1, 'source.collector': 1, created: 1 });

// Index the parcel ID
responseSchema.index({ survey: 1, parcel_id: 1 });

// Index the object ID
responseSchema.index({ survey: 1, object_id: 1 });

responseSchema.set('toObject', {
  transform: function (doc, ret, options) {
    return {
      id: ret.id,
      survey: ret.survey,
      source: ret.source,
      created: ret.created,
      geo_info: {
        centroid: ret.geo_info.centroid,
        parcel_id: ret.geo_info.parcel_id,
        geometry: ret.geo_info.geometry,
        humanReadableName: ret.geo_info.humanReadableName
      },
      files: ret.files,
      parcel_id: ret.parcel_id,
      object_id: ret.object_id,
      responses: ret.responses
    };
  }
});

// Set the creation date.
responseSchema.pre('save', function setCreated(next) {
  if (this.created === undefined) {
    this.created = new Date();
  }
  next();
});

// Allow either parcel_id or object_id.
// Eventually we'll deprecate parcel_id.
responseSchema.pre('save', function setObjectId(next) {
  if (this.parcel_id !== undefined && this.object_id === undefined) {
    this.object_id = this.parcel_id;
  } else if (this.object_id !== undefined && this.parcel_id === undefined) {
    this.parcel_id = this.object_id;
  }
  next();
});

var Response = module.exports = mongoose.model('Response', responseSchema, 'responseCollection');
