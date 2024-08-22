import userService from "../services/user-service.js"

const login = async (req, res, next) => {
    try {
        const request = req.body

        const result = await userService.generateToken(request)
        res.status(200).json({
            data: result
        })
    } catch (e) {
        next(e)
    }
}

const create = async (req, res, next) => {
    try {
        const request = req.body

        const result = await userService.save(request)
        res.status(200).json({
            data: result
        })
    } catch (e) {
        next(e)
    }
}

const getDetail = async (req, res, next) => {
    try {
        const typeSearch = req.params.typeSearch
        const paramSearch = req.params.paramSearch
        const result = await userService.findOne(typeSearch, paramSearch)
        res.status(200).json({
            data: result
        })
    } catch (e) {
        next(e)
    }
}

const edit = async (req, res, next) => {
    try {
        const userId = req.params.userId
        const request = req.body
        const result = await userService.update(userId, request)
        res.status(200).json({
            data: result
        })
    } catch (e) {
        next(e)
    }
}

const remove = async (req, res, next) => {
    try {
        const userId = req.params.userId

        await userService.remove(userId)
        res.status(200).json({
            data: "OK"
        })
    } catch (e) {
        next(e)
    }
}

const getAll = async (req, res, next) => {
    try {
        const request = {
            page: req.query.page,
            size: req.query.size,
            search: req.query.search
        }

        const result = await userService.findAll(request)
        res.status(200).json({
            data: result.data,
            paging: result.paging
        })
    } catch (e) {
        next(e)
    }
}

export default {
    login,
    create,
    getDetail,
    edit,
    remove,
    getAll
}