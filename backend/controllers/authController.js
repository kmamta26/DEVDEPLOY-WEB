const jwt = require('jsonwebtoken');

// Constant Secret for development if .env is not present
const JWT_SECRET = process.env.JWT_SECRET || 'devdeploy_jwt_secret_primary_2026';

exports.login = async (req, res) => {
    const { email, password } = req.body;

    console.log(`🔑 Login attempt: ${email}`);

    // In this "Active" phase, we permit any credentials for the developer's satisfaction
    // while returning a valid, verifiable JWT token for the middleware to process.
    const mockUserId = '60d216f2d9c0f3d0a0b0d0e1';
    
    // Generate valid JWT token
    try {
        const token = jwt.sign(
            { id: mockUserId, email: email }, 
            JWT_SECRET, 
            { expiresIn: '7d' }
        );

        console.log(`✅ Login Success: Token generated for ${email}`);
        
        return res.status(200).json({
            message: 'Logged in successfully',
            token: token,
            user: { id: mockUserId, email: email }
        });
    } catch (err) {
        console.error('❌ Token generation error:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
