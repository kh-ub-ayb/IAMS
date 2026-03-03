require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('./src/models/User.model');
const { Role } = require('./src/models/Role.model');

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find().populate('role');
    console.log("--- USERS IN DB ---");
    users.forEach(u => {
        console.log(`Role: ${u.role ? u.role.name : 'None'} | Name: ${u.name} | Email: ${u.email}`);
    });
    process.exit(0);
}

run().catch(console.error);

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
