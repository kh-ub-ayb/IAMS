'use strict';

/**
 * Seed Script — Phase 2
 *
 * Creates:
 *  - Default roles (SuperAdmin, Manager, ClassTeacher, Teacher, Student)
 *  - Default institution
 *  - Initial SuperAdmin user
 *
 * Run with: node src/seeders/seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { Role, ROLES } = require('../models/Role.model');
const Institution = require('../models/Institution.model');
const User = require('../models/User.model');

const MONGO_URI = process.env.MONGO_URI;

const run = async () => {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected for seeding.\n');

    // ── 1. Seed Roles ─────────────────────────────────────────────────────────
    const roleDescriptions = {
        [ROLES.SUPER_ADMIN]: 'Full system access. Created at deployment.',
        [ROLES.MANAGER]: 'Academic & finance head. Created by SuperAdmin.',
        [ROLES.CLASS_TEACHER]: 'Branch controller. Created by Manager.',
        [ROLES.TEACHER]: 'Manages subjects & attendance. Created by Manager.',
        [ROLES.STUDENT]: 'View-only academic portal access.',
    };

    const createdRoles = {};
    for (const roleName of Object.values(ROLES)) {
        const existing = await Role.findOne({ name: roleName });
        if (existing) {
            console.log(`   SKIP  Role "${roleName}" already exists.`);
            createdRoles[roleName] = existing;
        } else {
            const role = await Role.create({
                name: roleName,
                description: roleDescriptions[roleName],
            });
            console.log(`   ✅ Created Role: ${roleName}`);
            createdRoles[roleName] = role;
        }
    }

    // ── 2. Seed Default Institution ───────────────────────────────────────────
    let institution = await Institution.findOne({ code: 'DEFAULT' });
    if (institution) {
        console.log('\n   SKIP  Institution "DEFAULT" already exists.');
    } else {
        institution = await Institution.create({
            name: 'Default University',
            code: 'DEFAULT',
            address: 'Main Campus',
        });
        console.log('\n   ✅ Created Institution: Default University');
    }

    // ── 3. Seed SuperAdmin User ───────────────────────────────────────────────
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'superadmin@iams.edu';
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123';

    let superAdmin = await User.findOne({ email: superAdminEmail });
    if (superAdmin) {
        console.log(`\n   SKIP  SuperAdmin "${superAdminEmail}" already exists.`);
    } else {
        superAdmin = await User.create({
            name: 'Super Admin',
            email: superAdminEmail,
            password: superAdminPassword,      // Pre-save hook will hash this
            role: createdRoles[ROLES.SUPER_ADMIN]._id,
            institution: institution._id,
            createdBy: null,
        });
        console.log(`\n   ✅ Created SuperAdmin: ${superAdminEmail}`);
        console.log(`   ⚠️  Change the default password immediately!`);
    }

    console.log('\n🎉 Seeding complete.\n');
    await mongoose.disconnect();
    process.exit(0);
};

run().catch((err) => {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
});

// © 2026 Syed Khubayb Ur Rahman
// GitHub: https://github.com/kh-ub-ayb
