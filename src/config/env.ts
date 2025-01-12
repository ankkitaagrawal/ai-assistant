
/**
 * This file serves as a configuration file for the environment variables.
 * -> Any one can refer this file to check what variables are required to run the application.
 * -> If env key changes, it needs to be updated only once in this file.
 * -> Validation can be added to the env variables.
 */

const env = {
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    TOKEN_SECRET_KEY: process.env.TOKEN_SECRET_KEY,
    RTLAYER_API_KEY: process.env.RTLAYER_API_KEY,
    MONGO_URI: process.env.MONGODB_CONNECTION_URI as string,
    QUEUE_CONNECTION_URL: process.env.QUEUE_CONNECTIONURL,
    CHANNEL_AUTHKEY: process.env.CHANNEL_AUTHKEY,
    // New Relic Config
    NEW_RELIC_LICENSE_KEY: process.env.NEW_RELIC_LICENSE_KEY,
    NEW_RELIC_APP_NAME: process.env.NEW_RELIC_APP_NAME,
    // Middleware Config
    AI_MIDDLEWARE_AUTH_KEY: process.env.AI_MIDDLEWARE_AUTH_KEY as string,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    PINECONE_API_KEY: process.env.PINECONE_API_KEY,
    OPENAI_API_KEY_EMBEDDING: process.env.OPENAI_API_KEY_EMBEDDING,
    PINECONE_INDEX_NAME: process.env.PINECONE_INDEX_NAME,
    // Redis
    REDIS_CONNECTION_STRING: process.env.REDIS_CONNECTION_STRING,
    // Amplitude
    AMPLITUDE_API_KEY: process.env.AMPLITUDE_API_KEY,
    // Proxy
    PROXY_API_KEY: process.env.PROXY_API_KEY,
}

export default env;