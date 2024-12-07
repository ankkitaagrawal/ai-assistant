import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { createUser, getUserDetailsByProxyId } from '../dbservices/user';
import { getUserByEmailId } from '../utility/channel';

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
            tokenData: tokenData;
        }
    }
}
export const userChannelPoxyMap: { [key: string]: any } = {};

const getUserChannelData = async (userId: string, userEmail: string) => {
    // First, check in the in-memory map
    let userChannelData = userChannelPoxyMap[userId];
    if (!userChannelData) {
        userChannelData = await getUserDetailsByProxyId(userId);
        if (!userChannelData) {
            const channelUser = await getUserByEmailId(userEmail);
            userChannelData = await createUser({ proxyId: userId, channelId: channelUser?.userId });
            userChannelData.name = channelUser?.title;
            userChannelData.email = channelUser?.email;
        }
        userChannelPoxyMap[userId] = userChannelData;
    }

    return userChannelData;  // Return the data (either from the map or DB)
};

const decodeToken = async (req: Request, res: Response, next: NextFunction) => {
    let token = req?.get('Authorization');
    token = token?.split(' ')?.[1] || token;
    if (!token) {
        return res.status(498).json({ message: 'invalid token' });
    }
    try {
        let decodedToken = jwt.verify(token, process.env.TOKEN_SECRET_KEY!);
        // userid given by proxy find channel id search by email ;
        if (!decodedToken) {
            return res.status(404).json({ message: 'data not found' });
        }
        req.tokenData = decodedToken as tokenData;
        res.locals.userdata = await getUserChannelData(req.tokenData?.user?.id, req.tokenData?.user?.email);
    } catch (err: any) {
        console.log(err, "err");
        return res.status(401).json({ message: 'unauthorized user' });
    }
    return next();
};

export { decodeToken };