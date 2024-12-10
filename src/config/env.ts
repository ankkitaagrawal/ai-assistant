
/**
 * This file serves as a configuration file for the environment variables.
 * -> Any one can refer this file to check what variables are required to run the application.
 * -> If env key changes, it needs to be updated only once in this file.
 * -> Validation can be added to the env variables.
 */

const env = {
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    AI_MIDDLEWARE_AUTH_KEY: process.env.AI_MIDDLEWARE_AUTH_KEY,
    TOKEN_SECRET_KEY: process.env.TOKEN_SECRET_KEY,
    RTLAYER_API_KEY: process.env.RTLAYER_API_KEY,
    MONGO_URI: process.env.MONGODB_CONNECTION_URI,
    QUEUE_CONNECTION_URL: process.env.QUEUE_CONNECTIONURL,
    CHANNEL_AUTHKEY: process.env.CHANNEL_AUTHKEY,
    // New Relic Config
    NEW_RELIC_LICENSE_KEY: process.env.NEW_RELIC_LICENSE_KEY,
    NEW_RELIC_APP_NAME: process.env.NEW_RELIC_APP_NAME,
}

export default env;