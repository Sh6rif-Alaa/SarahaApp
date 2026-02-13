export const create = async ({ data, model } = {}) => {
    return await model.create(data)
}

export const aggregate = async ({ pipeline = [], model } = {}) => {
    return await model.aggregate(pipeline)
}

export const findOne = async ({ filter = {}, model, options = {} } = {}) => {
    const doc = model.findOne(filter, options)
    if (options.populate) doc.populate(options.populate)
    if (options.skip) doc.skip(options.skip)
    if (options.limit) doc.limit(options.limit)
    return await doc.exec()
}

export const findById = async ({ model, id, populate = [], select = "" } = {}) => {
    return await model.findById(id).populate(populate).select(select)
}

export const deleteOne = async ({ model, filter } = {}) => {
    return await model.deleteOne(filter)
}