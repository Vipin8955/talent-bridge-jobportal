const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

const wipeData = async () => {
  try {
    console.log('[Wipe] Connecting to MongoDB Atlas...');
    await connectDB();

    console.log('[Wipe] Deleting all applications...');
    await Application.deleteMany({});

    console.log('[Wipe] Deleting all jobs...');
    await Job.deleteMany({});

    console.log('[Wipe] Deleting all users...');
    await User.deleteMany({});

    console.log('\n=============================================');
    console.log('✨ ALL DUMMY DATA HAS BEEN COMPLETELY REMOVED!');
    console.log('Database is now 100% clean and ready for your testing.');
    console.log('=============================================\n');

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('[Wipe] Error wiping database:', err);
    await disconnectDB();
    process.exit(1);
  }
};

wipeData();
