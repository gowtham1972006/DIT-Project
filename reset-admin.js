'use strict';

const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error('MONGODB_URI not set'); process.exit(1); }

const NEW_PASSWORD = '123456'; // ← change this if you want a different password

const userSchema = new mongoose.Schema({
  username:      String,
  password_hash: String,
  role:          String,
});

async function run() {
  await mongoose.connect(MONGODB_URI);
  const User = mongoose.models.User || mongoose.model('User', userSchema);

  const hash = await bcrypt.hash(NEW_PASSWORD, 10);
  const result = await User.findOneAndUpdate(
    { username: 'admin' },
    { password_hash: hash, role: 'admin', status: 'approved' },
    { returnDocument: 'after', upsert: true }
  );

  console.log(`✅ Admin password reset to: ${NEW_PASSWORD}`);
  console.log(`   User ID: ${result._id}`);
  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
