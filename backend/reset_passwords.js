require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const { Role } = require('./src/models/Role.model'); // Required for populate
const User = require('./src/models/User.model');

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    // Exclude student because we know the student login works
    const users = await User.find({ email: { $ne: 'charlie.s@iams.edu' } }).populate('role');

    console.log("--- RESETTING CREDENTIALS ---");
    for (let u of users) {
        u.password = 'Admin@123';
        // Note: mongoose pre-save hook in User.model.js will hash this
        await u.save();
        console.log(`Role: ${u.role ? u.role.name : 'Unknown'} | Name: ${u.name} | Email: ${u.email} | New Password: Admin@123`);
    }

    console.log("--- DONE ---");
    process.exit(0);
}

run().catch(console.error);

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
