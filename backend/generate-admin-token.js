const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();
const uri = 'mongodb://127.0.0.1:27017/safoua_academy';
(async () => {
  try {
    await mongoose.connect(uri);
    let admin = await User.findOne({ role: { $in: ['admin', 'administrateur'] } });
    if (!admin) {
      admin = await User.create({ nom: 'Admin', prenom: 'Test', email: 'admin@test.local', mdp: 'secret', role: 'administrateur' });
      console.log('created admin', admin._id);
    }
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET || 'secret_temporaire_123', { expiresIn: '1d' });
    console.log('ADMIN_TOKEN=' + token);
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
})();
