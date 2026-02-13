export const create = async ({ data, model } = {}) => {
    return await model.create(data)
}

export const findOne = async ({ filter = {}, model, options = {} } = {}) => {
    const doc = model.findOne(filter, options)
    if (options.populate) doc.populate(options.populate)
    if (options.skip) doc.skip(options.skip)
    if (options.limit) doc.limit(options.limit)
    return await doc.exec()
}

export const findById = async ({ model, id, populate = [], select = "" }) => {
    return await model.findById(id).populate(populate).select(select)
}

export const updateOne = async ({ filter = {}, model, update = {}, options = {} } = {}) => {
    const doc = model.updateOne(filter, update, { runValidators: true, ...options })
    return await doc.exec()
}

export const findOneAndUpdate = async ({ filter = {}, model, update = {}, options = {} } = {}) => {
    const doc = model.findOneAndUpdate(filter, update, { new: true, runValidators: true, ...options })
    return await doc.exec()
}