import jwt from 'jsonwebtoken';
import getConfig from '../applications/config.js';

export const authMiddleware = async (req, res, next) => {
    const token = req.get("Authorization")?.split(' ')[1];
    if (!token) {
        res.status(401).json({
            errors: "Unauthorized"
        }).end();
    } else {
        // const token = req.headers['authorization']?.split(' ')[1];    
        jwt.verify(token, getConfig.secretKey, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Invalid or expired token' });
            }
            
            // Menyimpan informasi pengguna yang terdekripsi di req.user
            req.username = decoded;
            next();
        });
    }
}