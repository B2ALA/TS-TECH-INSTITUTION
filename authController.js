const supabase = require('../config/db');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

exports.signup = async (req, res) => {
    try {
        const { fullName, email, password, role } = req.body;
        
        if (!['student', 'instructor'].includes(role)) {
            return res.status(400).json({ error: "Invalid target registration role classification specified." });
        }

        // 1. Trigger signup operation inside Supabase Auth services
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password
        });

        if (authError) return res.status(400).json({ error: authError.message });
        if (!authData.user) return res.status(400).json({ error: "Onboarding routine failed to resolve user parameters." });

        // Instructors register with a pending status flag, while students initialize as active
        const initialStatus = (role === 'instructor') ? 'pending_approval' : 'active';

        // 2. Synchronize profile definitions into public table mappings
        const profile = await User.createProfile(authData.user.id, fullName, email, role, initialStatus);

        return res.status(201).json({
            message: role === 'instructor' 
                ? "Instructor profile initialized successfully. Pending administrative verification check clearance." 
                : "Student user account registry established successfully.",
            profile
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Sign in using Supabase Auth
        const { data: signData, error: signError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (signError) return res.status(401).json({ error: signError.message });

        // Retrieve identity profile records
        const profile = await User.findById(signData.user.id);

        if (profile.status === 'pending_approval') {
            return res.status(403).json({ error: "Instructor access profile is locked pending administrative verification." });
        }
        if (profile.status === 'blocked') {
            return res.status(403).json({ error: "Access suspended. Please open a support request terminal ticket." });
        }

        // Generate application validation session token string
        const token = jwt.sign(
            { id: profile.id, role: profile.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION }
        );

        return res.status(200).json({
            message: "Authentication handshake successful.",
            token,
            profile: {
                id: profile.id,
                fullName: profile.full_name,
                email: profile.email,
                role: profile.role
            }
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
