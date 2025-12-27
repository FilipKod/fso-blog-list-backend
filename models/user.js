const mongoose = require("mongoose");

/**
 * @type {import('mongoose').Schema}
 */
const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: [true, "username is required"],
    minLength: [3, "Username must contains at least 3 characters."],
    unique: true,
  },
  name: String,
  passwordHash: {
    type: String,
    required: true,
  },
  blogs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Blog" }],
});

userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject.__v;
    delete returnedObject._id;
    delete returnedObject.passwordHash;
  },
});

module.exports = mongoose.model("User", userSchema);
