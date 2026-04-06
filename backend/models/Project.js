const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  userId: { type: String, default: 'anonymous' }, // Made string + default for dev ease
  port: { type: Number, required: true },
  url: { type: String, required: true },
  githubRepo: { type: String },
  githubUrl: { type: String },
  status: { type: String, enum: ['deploying', 'running', 'failed', 'Live'], default: 'deploying' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);
