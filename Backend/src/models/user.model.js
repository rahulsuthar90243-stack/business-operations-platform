import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true

        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ["admin", "manager", "employee", "customer"],
            default: "customer"
        },
        isOnline: {
           type: Boolean,
           default: false,
        },
        lastSeen: {
           type: Date,
           default: null,
        },
    },{timestamps: true}
)


export const userModel = mongoose.model("userModel", userSchema);