require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('./src/models/User.model');
const { Role } = require('./src/models/Role.model');

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({ email: { $ne: 'charlie.s@iams.edu' } }).populate('role');

        const results = [];
        for (let u of users) {
            u.password = 'Admin@123';
            await u.save();
            results.push({
                role: u.role ? u.role.name : 'Unknown',
                name: u.name,
                email: u.email,
                password: 'Admin@123'
            });
        }
        console.log(JSON.stringify(results, null, 2));
    } catch (err) {
        console.error("ERROR:", err);
    } finally {
        process.exit(0);
    }
}

run();

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
