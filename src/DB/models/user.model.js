import mongoose from "mongoose";
import { genderEnum, providerEnum } from "../../common/enum/user.enum.js";

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            minLength: [3, 'too short'],
            maxLength: [16, 'too long'],
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            minLength: [3, 'too short'],
            maxLength: [16, 'too long'],
            trim: true,
        },
        password: {
            type: String,
            required: true,
            trim: true,
            minLength: [6, "password is too short"]
        },
        email: {
            type: String,
            unique: true,
            required: true,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
        },
        age: {
            type: Number,
            required: true,
            min: [16, "age must be more than 16"],
            max: [80, "age must be less than 80"]
        },
        gender: {
            type: String,
            enum: Object.values(genderEnum),
            required: true,
            default: genderEnum.male
        },
        provider: {
            type: String,
            enum: Object.values(providerEnum),
            required: true,
            default: providerEnum.system
        },
        profilePicture: String,
        confirmed: Boolean,
    },
    {
        timestamps: true,
        strictQuery: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)

userSchema.virtual('userName').get(function () {
    return this.firstName + ' ' + this.lastName
}).set(function (v) {
    this.firstName = v.split(' ')[0]
    this.lastName = v.split(' ')[1]
})

const userModel = mongoose.models.user || mongoose.model('user', userSchema)
userModel.syncIndexes()
export default userModel