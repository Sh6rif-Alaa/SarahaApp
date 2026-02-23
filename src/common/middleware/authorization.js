
const authorization = (roles = []) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role))
            throw new Error('unAuthorize', { cause: 400 })
        next()
    }
}


export default authorization