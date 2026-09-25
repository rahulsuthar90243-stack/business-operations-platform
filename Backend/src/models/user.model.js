import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
    {
        username: {
        type: String
        },
        email: {
            type: String,
            require: true
        },
        password: {
            type: String,
            require: true
        },
        role: {
            type: String,
            enum: ["admin", "manager", "employee", "customer"],
            default: "customer"
        }
    },{timestamps: true}
)


export const userModel = mongoose.model("userModel", userSchema);