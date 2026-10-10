import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      minlength: [3, "Project name must be at least 3 characters"],
      maxlength: [100, "Project name cannot exceed 100 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default: "",
    },

    status: {
      type: String,
      enum: {
        values: ["planned", "active", "on-hold", "completed", "cancelled"],
        message: "{VALUE} is not a valid status",
      },
      default: "planned",
    },

    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Project manager is required"],
    },

    createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    },

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },

    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
      validate: {
        validator: function (value) {
          // `this` works on create/save; skip check if startDate is unavailable
          return !this.startDate || value >= this.startDate;
        },
        message: "Due date must be on or after the start date",
      },
    },
  },
  { timestamps: true } // adds createdAt & updatedAt
);

// Useful indexes for common queries
projectSchema.index({ status: 1 });
projectSchema.index({ manager: 1 });
projectSchema.index({ members: 1 });

export const projectModel = mongoose.model("projectModel", projectSchema);
