const { Schema, model, Types } = require('mongoose');

const AdminLogsSchema = new Schema(
  {
    adminId: {
      type: Types.ObjectId,
      ref: 'User', // or 'Admin' if you have a separate Admin model
      required: true,
      index : true
    },
    action: {
      type: String,
      required: true,
    },
    targetModel: {
      type: String,
      required: true,
    },
    data: {
      type: Schema.Types.Mixed, // Correct usage of Mixed type
    }
  },
  { timestamps: true }
);

module.exports = model('AdminLog', AdminLogsSchema);
