const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 6,
      select: false,
    },
role: {
      type: String,
      default: 'customer'
    },
    subscription: {
      planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubscriptionPlan'
      },
      planName: String,
      startDate: Date,
      endDate: Date,
      status: {
        type: String,
        enum: ['active', 'expired', 'cancelled', 'none'],
        default: 'none'
      },
      paymentId: String,
    },
  },

  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
