const jwt = require('jsonwebtoken');

// Constant Secret for development if .env is not present
const JWT_SECRET = process.env.JWT_SECRET || 'devdeploy_jwt_secret_primary_2026';

module.exports = (req, res, next) => {
    // 1. Check for Authorization Header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('🔒 Auth denied: No token provided in headers.');
        return res.status(401).json({ 
            error: 'Authorization required', 
            details: 'No Bearer token found in request headers.' 
        });
    }

    const token = authHeader.split(' ')[1].trim();

    // 2. Developer Bypass for Active Sessions (Phase 2 Success)
    if (token === 'dev_mock_token_active') {
        req.user = { id: '60d216f2d9c0f3d0a0b0d0e1', email: 'dev@devdeploy.io' };
        return next();
    }

    // 3. Verify JWT
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        console.log(`✅ Token verified for user: ${decoded.email || decoded.id}`);
        next();
    } catch (err) {
        console.error(`❌ Token invalid: ${err.message}`);
        
        // Specific Error for Expiration
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                error: 'Token expired', 
                details: 'Your session has expired. Please login again.' 
            });
        }

        return res.status(401).json({ 
            error: 'Invalid token', 
            details: 'The provided authentication token is malformed or unauthorized.' 
        });
    }
};
