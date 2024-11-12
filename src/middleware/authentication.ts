import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// Extend the Express Request interface to include the tokenData property

interface tokenData {
    "org": {
        "id": string,
            "name": string
    },
    "user": {
        "id": string
        "meta": string
        "email": string
    },
}; // Adjust the type according to your token structure

declare global {
    namespace Express {
        interface Request {
        tokenData?: tokenData;
        }
    }
}

const decodeToken = async (req: Request, res: Response, next: NextFunction) => {
    let token = req?.get('Authorization');
    token = token?.split(' ')?.[1] || token;
    if (!token) {
        return res.status(498).json({ message: 'invalid token' });
    }
    try {
        let decodedToken = jwt.verify(token, process.env.TOKEN_SECRET_KEY!);
        if (!decodedToken) {
            return res.status(404).json({ message: 'data not found' });
        }
        req.tokenData = decodedToken as tokenData;
    } catch (err: any) {
        return res.status(401).json({ message: 'unauthorized user' });
    }
    return next();
};

export { decodeToken };