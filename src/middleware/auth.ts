import { NextFunction, Request, RequestHandler, RequestParamHandler, Response } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../service/logger';
import { ApiError } from '../error/api-error';
import { createUser, getUserDetailsByProxyId } from '../dbservices/user';
import { getUserByEmailId } from '../utility/channel';
export enum AuthMethod {
    TOKEN = "token",
    API_KEY = "apiKey",
    NONE = "none"
}
interface TokenData {
    "ip": string,
    "org": {
        "id": string,
        "name": string
    },
    "user": {
        "id": string
        "meta": string
        "email": string
    },
    "userEmail": string
};

export function auth(authMethods: AuthMethod[] = [AuthMethod.TOKEN]) {
    return async function (req: Request, res: Response, next: NextFunction) {
        const methods = [...authMethods];
        let done = false;
        while (methods.length > 0 && !done) {
            const method = methods.shift();
            logger.info(`Authenticating with ${method}...`);
            try {
                switch (method) {
                    case 'token':
                        await tokenAuth(req, res, next);
                        done = true;
                        break;
                    case 'apiKey':
                        await apiKeyAuth(req, res, next);
                        done = true;
                        break;
                    case 'none':
                        done = true;
                        next();
                        break;
                    default:
                        done = true;
                        next(new ApiError('Authentication failed. Please authenticate yourself.', 401));
                        break;


                }
            } catch (error) {
                logger.error(error);
                if (methods.length == 0) {
                    next(error);
                }
            }
        }
    }
}

export async function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
    let apiKey = req.header('x-api-key') ? req.header('x-api-key') : req.query.apiKey?.toString();
    if (apiKey) {
        throw new ApiError('Not Implemented', 501);
    } else {
        throw new ApiError('API Key not found', 401);
    }
}
export async function tokenAuth(req: Request, res: Response, next: NextFunction) {
    let token = req.header('Authorization') ? req.header('Authorization')?.replace('Bearer ', '') : req.query.token?.toString();
    if (token) {
        const tokenData = validateToken(token);
        console.log(tokenData);
        const proxyId = tokenData.user.id;
        const userEmail = tokenData.user.email;
        // Populate user details in res.locals
        const user = await getUserDetail(proxyId, userEmail).catch((error) => { throw new ApiError('User not found', 401) });
        res.locals.user = {
            proxyId: user?.proxyId,
            channelId: user?.channelId,
            name: user?.name,
            email: userEmail,
            avatar: user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=random`
        };
        next();
    } else {
        logger.error("Token not found");
        throw new ApiError('Token not found', 401);
    }

}

export function validateToken(token: string): TokenData {
    const tokenSecret = process.env.TOKEN_SECRET_KEY;
    if (!tokenSecret) throw new Error('Token secret not found');
    const decodedToken = jwt.verify(token, tokenSecret) as TokenData;
    return decodedToken;
}

interface User {
    proxyId: string;
    channelId: string;
    name?: string,
    email?: string,
    avatar?: string,
}
async function getUserDetail(proxyId: string, email: string): Promise<User> {
    let user = await getUserDetailsByProxyId(proxyId).catch((error) => null) as User;
    if (!user) {
        // Get user detail from channel and save in db
        const channelUser = await getUserByEmailId(email);
        user = await createUser({ proxyId, channelId: channelUser?.userId, name: channelUser?.title }) as User;
    }
    return user;
}
