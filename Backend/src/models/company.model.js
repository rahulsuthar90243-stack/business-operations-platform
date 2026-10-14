import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },

    companyEmail: {
      type: String,
      required: [true, "Company email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },

    contactDetails: {
      username: { type: String, trim: true },
      email: { type: String, trim: true },
      phone: { type: String, trim: true },
      address: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true },
    },

    // Unique company login code, e.g. "ACME123"
    workspaceCode: {
      type: String,
      required: [true, "Workspace code is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "active", "suspended"],
      default: "pending",
    },
  },
  { timestamps: true } // adds createdAt & updatedAt
);

const Company = mongoose.model("Company", companySchema);

export default Company;