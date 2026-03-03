const mongoose = require('mongoose');
const env = require('./src/config/env');
const Semester = require('./src/models/Semester.model');

mongoose.connect(env.mongoUri).then(async () => {
    const sems = await Semester.find().sort({ number: 1 }).limit(8);
    
    // Reset Sem 1 to Active, others Inactive
    sems[0].isActive = true;
    sems[0].isCompleted = false;
    await sems[0].save();

    sems[1].isActive = false;
    sems[1].isCompleted = false;
    await sems[1].save();

    console.log('Semesters reset. 1 is Active, 2 is Inactive.');
    process.exit(0);
}).catch(console.error);

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
