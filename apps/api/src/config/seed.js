require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Inline models to avoid circular deps in seed
const userSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true }, password: String,
  role: String, isActive: { type: Boolean, default: true },
}, { timestamps: true });
const empSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  employeeId: String, phone: String,
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  designation: String, joiningDate: Date, status: { type: String, default: 'active' },
}, { timestamps: true });
const deptSchema = new mongoose.Schema({ name: String, code: String, description: String, isActive: { type: Boolean, default: true } }, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Employee = mongoose.model('Employee', empSchema);
const Department = mongoose.model('Department', deptSchema);

const hash = (pw) => bcrypt.hash(pw, 12);

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hr_crm');
  console.log('🌱 Connected to MongoDB, seeding…');

  // Clear existing
  await Promise.all([User.deleteMany({}), Employee.deleteMany({}), Department.deleteMany({})]);
  console.log('🧹 Cleared existing data');

  // Departments
  const depts = await Department.insertMany([
    { name: 'Engineering', code: 'ENG', description: 'Software engineering and development' },
    { name: 'Human Resources', code: 'HR', description: 'People operations and talent management' },
    { name: 'Product', code: 'PRD', description: 'Product strategy and design' },
    { name: 'Finance', code: 'FIN', description: 'Financial planning and accounting' },
    { name: 'Marketing', code: 'MKT', description: 'Brand and growth marketing' },
  ]);
  console.log(`✅ Created ${depts.length} departments`);

  const engDept = depts[0];
  const hrDept = depts[1];
  const prdDept = depts[2];

  // Users
  const users = [
    { name: 'Super Admin', email: 'admin@hrcrm.com', password: await hash('Admin@123'), role: 'admin' },
    { name: 'Sarah HR', email: 'hr@hrcrm.com', password: await hash('Hr@123'), role: 'hr' },
    { name: 'John Engineer', email: 'emp@hrcrm.com', password: await hash('Emp@123'), role: 'employee' },
    { name: 'Priya Sharma', email: 'priya@hrcrm.com', password: await hash('Welcome@123'), role: 'employee' },
    { name: 'Rahul Verma', email: 'rahul@hrcrm.com', password: await hash('Welcome@123'), role: 'employee' },
    { name: 'Emily Chen', email: 'emily@hrcrm.com', password: await hash('Welcome@123'), role: 'employee' },
    { name: 'Marcus Johnson', email: 'marcus@hrcrm.com', password: await hash('Welcome@123'), role: 'employee' },
  ];

  const createdUsers = await User.insertMany(users);
  console.log(`✅ Created ${createdUsers.length} users`);

  const [adminUser, hrUser, empUser, priya, rahul, emily, marcus] = createdUsers;

  // Employees
  const employees = [
    { user: hrUser._id, employeeId: 'EMP0001', department: hrDept._id, designation: 'HR Manager', joiningDate: new Date('2022-01-15'), phone: '+91 98765 00001' },
    { user: empUser._id, employeeId: 'EMP0002', department: engDept._id, designation: 'Senior Software Engineer', joiningDate: new Date('2022-03-01'), phone: '+91 98765 00002' },
    { user: priya._id, employeeId: 'EMP0003', department: prdDept._id, designation: 'Product Manager', joiningDate: new Date('2022-06-01'), phone: '+91 98765 00003' },
    { user: rahul._id, employeeId: 'EMP0004', department: engDept._id, designation: 'Frontend Developer', joiningDate: new Date('2023-01-10'), phone: '+91 98765 00004' },
    { user: emily._id, employeeId: 'EMP0005', department: depts[4]._id, designation: 'Marketing Lead', joiningDate: new Date('2023-04-01'), phone: '+91 98765 00005' },
    { user: marcus._id, employeeId: 'EMP0006', department: depts[3]._id, designation: 'Finance Analyst', joiningDate: new Date('2023-07-15'), phone: '+91 98765 00006' },
  ];

  await Employee.insertMany(employees);
  console.log(`✅ Created ${employees.length} employee profiles`);

  console.log('\n🎉 Seed complete! Demo credentials:');
  console.log('   Admin    → admin@hrcrm.com  / Admin@123');
  console.log('   HR       → hr@hrcrm.com     / Hr@123');
  console.log('   Employee → emp@hrcrm.com    / Emp@123');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
