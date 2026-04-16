const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  code: { type: String, unique: true, uppercase: true },
  description: { type: String },
  head: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  budget: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

departmentSchema.pre('save', function (next) {
  if (!this.code) {
    this.code = this.name.substring(0, 3).toUpperCase() + Date.now().toString().slice(-4);
  }
  next();
});

module.exports = mongoose.model('Department', departmentSchema);
