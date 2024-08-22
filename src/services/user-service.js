import jwt from 'jsonwebtoken';
import User from '../models/user-model.js';
import { ResponseError } from "../errors/response-error.js"
import { createOrUpdateUserValidation } from "../validations/user-validation.js"
import { validate } from "../validations/validation.js"
import mongoose from 'mongoose';
import getConfig from '../applications/config.js';
import redisService from './redis-service.js';
import functionService from './function-service.js';
import enumLabel from '../enums/enum.js';

const generateToken = async (request) => {

    if (request.username !== getConfig.appUsername || request.password !== getConfig.appPassword) {
        throw new ResponseError(400, 'Wrong username or password');
    }

    const payload = {
        username: request.username,
    };

    // Set Expire
    const options = {
        expiresIn: '2h'
    };

    // Create Token
    return jwt.sign(payload, getConfig.secretKey, options);
}

const save = async (request) => {
        const user = validate(createOrUpdateUserValidation, request)

        // Validation Identity Number and account number
        const isValidIdentityNumber = functionService.isOnlyNumbers(request.identity_number)
        if (!isValidIdentityNumber) {
            throw new ResponseError(400, "please input number only for identity number")
        }
        const isValidAccountNumber = functionService.isOnlyNumbers(request.account_number)
        if (!isValidAccountNumber) {
            throw new ResponseError(400, "please input number only for account number")
        }

        // Check username register or not
        const checkUsername = await findOneMainFunction(enumLabel.usernameEnum, request.username)
        if (checkUsername !== null) {
            throw new ResponseError(400, "username have been registered")
        }

        // Check account number register or not
        const checkAccountNumber = await findOneMainFunction(enumLabel.accountNumberEnum, request.account_number)
        if (checkAccountNumber !== null) {
            throw new ResponseError(400, "account number have been registered")
        }

        // Check identity number register or not
        const checkIdentityNumber = await findOneMainFunction(enumLabel.identityNumberEnum, request.identity_number)
        if (checkIdentityNumber !== null) {
            throw new ResponseError(400, "identity number have been registered")
        }

        const newUser = new User(user);
        return await newUser.save();
}

const findOneMainFunction = async (typeSearch, paramSearch) => {
    const query = {};

    // Get data from redis, if null get from mongo
    const keyRedis = `${typeSearch}_${paramSearch}`
    let dataUser = await redisService.getFromCache(keyRedis)
    if (dataUser) {
        dataUser = JSON.parse(dataUser);
        console.log(`findOneMainFunction search by: ${typeSearch} with value : ${paramSearch}, get from redis`)
    } else if (!dataUser) {
        console.log(`findOneMainFunction search by: ${typeSearch} with value : ${paramSearch}, get from mongodb`)
        if (typeSearch === enumLabel.idEnum) {
            const isObjectId = mongoose.Types.ObjectId.isValid(paramSearch)
            if (!isObjectId) {
                throw new ResponseError(400, 'Please input valid format for ID');
            }
            query._id = paramSearch;
        } else if (typeSearch === enumLabel.accountNumberEnum) {
            query.account_number = paramSearch;
        } else if (typeSearch === enumLabel.identityNumberEnum) {
            query.identity_number = paramSearch;
        } else if (typeSearch === enumLabel.usernameEnum) {
            query.username = paramSearch;
        } else {
            throw new ResponseError(500, 'At least one parameter (id, account_number, or identity_number) is required.');
        }
    
        if (paramSearch === "" || paramSearch === ":paramSearch") {
            throw new ResponseError(500, 'please input search parameter');
        }
      
        dataUser = await User.findOne(query);
        
        // If found data user then save to redis
        if (dataUser) {
            await redisService.setOnCache(keyRedis, dataUser)
        }
    }

    return dataUser
}

const findOne = async (typeSearch, paramSearch) => {  
    const usersData = await findOneMainFunction(typeSearch, paramSearch);
    if (!usersData) {
        throw new ResponseError(400, "user is not found")
    }

    return usersData
}

const update = async (userId, request) => {
    const user = validate(createOrUpdateUserValidation, request)
    
    const oldDataUser = await User.findById(userId);

    if (!oldDataUser) {
        throw new ResponseError(400, "user not found")
    }

    // Validation Identity Number and account number
    const isValidIdentityNumber = functionService.isOnlyNumbers(request.identity_number)
    if (!isValidIdentityNumber) {
        throw new ResponseError(400, "please input number only for identity number")
    }
    const isValidAccountNumber = functionService.isOnlyNumbers(request.account_number)
    if (!isValidAccountNumber) {
        throw new ResponseError(400, "please input number only for account number")
    }

    // Check username register or not
    if (oldDataUser.username != request.username) {
        const checkUsername = await findOneMainFunction(enumLabel.usernameEnum, request.username)
        if (checkUsername !== null) {
            throw new ResponseError(400, "username have been registered")
        }
    }

    // Check account number register or not
    if (oldDataUser.account_number != request.account_number) {
        const checkAccountNumber = await findOneMainFunction(enumLabel.accountNumberEnum, request.account_number)
        if (checkAccountNumber !== null) {
            throw new ResponseError(400, "account number have been registered")
        }
    }

    // Check identity number register or not
    if (oldDataUser.identity_number != request.identity_number) {
        const checkIdentityNumber = await findOneMainFunction(enumLabel.identityNumberEnum, request.identity_number)
        if (checkIdentityNumber !== null) {
            throw new ResponseError(400, "identity number have been registered")
        }
    }

    const dataUpdated = await User.findByIdAndUpdate(userId, user, { new: true });
    if(dataUpdated){
        const statusRemoveCache = await removeFromRedis(dataUpdated)
    }

    return dataUpdated
}

const remove = async (userId) => {    
    const dataUser = await User.findById(userId);

    if (dataUser === null) {
        throw new ResponseError(400, "user not found")
    } else {
        const statusRemoveCache = await removeFromRedis(dataUser)
    }

    return await User.findByIdAndDelete(userId);
}

const findAll = async  (request) => {
    // Count Offset
    const skip = (request.page - 1) * request.size;

    // Prepare search query
    const searchQuery = {};

    if (request.search) {
        // like operator
        const regex = new RegExp(request.search, 'i'); // 'i' for search that not case-sensitive

        searchQuery.$or = [
            { identity_number: { $regex: regex } },
            { account_number: { $regex: regex } }
        ];
    }

    const users = await User.find(searchQuery)
                            .skip(skip)          
                            .limit(parseInt(request.size))
                            .exec();

    // Count total item
    const totalUsers = await User.countDocuments(searchQuery);

    return {
        data: users,
        paging: {
            page: request.page,
            total_item: totalUsers,
            total_page: Math.ceil(totalUsers / request.size)
        }
    }
}

const removeFromRedis = async (dataUser) => {
    let status = false

    if(dataUser){
        // remove from cache
        let arrayKey = []
        arrayKey.push(`${enumLabel.usernameEnum}_${dataUser.username}`)
        arrayKey.push(`${enumLabel.accountNumberEnum}_${dataUser.account_number}`)
        arrayKey.push(`${enumLabel.identityNumberEnum}_${dataUser.identity_number}`)
        arrayKey.push(`${enumLabel.idEnum}_${dataUser._id}`)
    
        for (let index = 0; index < arrayKey.length; index++) {
            const key = arrayKey[index];
            
            let result = await redisService.deleteFromCache(key)
            if(!result){
                console.log(`Key ${key} not found on redis`)
            }
        }
        status = true
    }

    return status
}

export default {
    generateToken,
    save,
    findOne,
    update,
    remove,
    findAll
}