import dotenv from 'dotenv';
dotenv.config();

const secretKey = process.env.JWT_SECRET_KEY || 'secretkeytesting';
const mongoURL = process.env.MONGO_URI || "mongodb://localhost:27017/db_alfindhuhawanbagja_betest";
const redisName = process.env.REDIS_NAME || "redis_alfindhuhawanbagja_betest";
const redisHost = process.env.REDIS_HOST || "127.0.0.1";
const redisPort = process.env.REDIS_PORT || 6379;
const appUsername = process.env.APP_USERNAME || "admin"; 
const appPassword = process.env.APP_PASSWORD || "admin"; 
const redisExpire = process.env.REDIS_EXPIRE || 900; // in seconds

export default {
    secretKey,
    redisName,
    mongoURL,
    redisHost,
    redisPort,
    appUsername,
    appPassword,
    redisExpire
}