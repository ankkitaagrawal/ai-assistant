import { User } from "./user";

declare global {
    namespace Express {
        interface Request {
            locals: {
                user?: User;
            }
        }
    }
}