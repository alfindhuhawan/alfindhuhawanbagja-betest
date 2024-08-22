import Redis from 'ioredis';
import getConfig from './config.js';

let redisClient;

redisClient = new Redis({
    name: getConfig.redisName,
    host: getConfig.redisHost,
    port: getConfig.redisPort,
    retryStrategy(times) {
        // Keep trying reconnect without limit
        console.error(`Redis connection attempt ${times}: Retrying in ${Math.min(times * 20000, 20000)}ms`);
        // Retry times always increase, but not pass 20 seconds
        return Math.min(times * 4000, 20000);
    },

});

redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
    console.error('Redis connection error:', err.message);
});

redisClient.on('end', () => {
    console.warn('Redis connection end');
});

export default redisClient;