import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userModel",
      required: [true, "User is required"],
    },
    action: {
      type: String,
      required: [true, "Action is required"],
      enum: {
        values: ["created", "updated", "deleted", "assigned"],
        message: "{VALUE} is not a valid action",
      },
    },
    entityType: {
      type: String,
      required: [true, "Entity type is required"],
      enum: {
        values: ["project", "ticket", "user"],
        message: "{VALUE} is not a valid entity type",
      },
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Entity ID is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Indexes for optimal querying of activity feeds and history
activitySchema.index({ entityId: 1, entityType: 1 });
activitySchema.index({ user: 1 });
activitySchema.index({ createdAt: -1 });

export const activityModel = mongoose.model("activityModel", activitySchema);

export default activityModel;
