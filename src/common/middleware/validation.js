const validation = (Schema) => {
    return (req, res, next) => {
        let errorResult = []
        for (const key of Object.keys(Schema)) {
            const { error } = Schema[key].validate(req[key], { abortEarly: false })
            if (error) {
                errorResult.push(
                    ...error.details.map((err) => ({
                        key,
                        message: err.message,
                        path: err.path[0],
                        type: err.type
                    }))
                )
            }
        }

        if (errorResult.length > 0) 
            return res.status(400).json({ message: 'validation error', error: errorResult })
        next()
    }
}


export default validation