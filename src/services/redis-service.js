import redisClient from '../applications/redis.js';
import getConfig from '../applications/config.js';

const redisName = getConfig.redisName

const getFromCache = async (key) => {
    let cachedData = null
    
    // Check cache on Redis
    if(redisClient && redisClient.status === 'ready'){
        cachedData = await redisClient.get(`${redisName}:${key}`);
    }

    return cachedData;
}

const setOnCache = async (key, data) => {
    let resultSet = null

    if(redisClient && redisClient.status === 'ready'){
        // Set Data On Cache
        resultSet = await redisClient.set(`${redisName}:${key}`, JSON.stringify(data), 'EX', getConfig.redisExpire); // Expire in seconds
    }

    return resultSet;
}

const deleteFromCache = async (key) => {
    let result = null

    if(redisClient && redisClient.status === 'ready'){
        // Remove data from cache
        result = await redisClient.del(`${redisName}:${key}`);
    }

    return result
};

export default {
    getFromCache,
    setOnCache,
    deleteFromCache
}