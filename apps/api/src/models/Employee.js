const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  employeeId: { type: String, unique: true },
  phone: { type: String, trim: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  designation: { type: String, trim: true },
  joiningDate: { type: Date },
  salary: { type: Number },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zip: String,
  },
  emergencyContact: {
    name: String,
    phone: String,
    relation: String,
  },
  documents: [{
    name: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now },
  }],
  status: { type: String, enum: ['active', 'inactive', 'on_leave', 'terminated'], default: 'active' },
}, { timestamps: true });

// Auto-generate employee ID
employeeSchema.pre('save', async function (next) {
  if (!this.employeeId) {
    const count = await mongoose.model('Employee').countDocuments();
    this.employeeId = `EMP${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Employee', employeeSchema);
