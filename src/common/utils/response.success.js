const successResponse = ({ res, status = 200, message = "done", data = undefined, token = undefined } = {}) => {
    return res.status(status).json({ message, data, token })
}

export default successResponse