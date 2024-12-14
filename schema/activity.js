"use strict";

const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  activity_type: {
    type: String,
    enum: ['PHOTO_UPLOAD', 'NEW_COMMENT', 'USER_REGISTER', 'USER_LOGIN', 'USER_LOGOUT', 'USER_LIKE', 'USER_UNLIKE'],
    required: true
  },
  photo_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Photo' },
  date_time: { type: Date, default: Date.now },
  details: { type: mongoose.Schema.Types.Mixed }
});

const ActivitySchema = mongoose.model('Activity', activitySchema);

module.exports = ActivitySchema;