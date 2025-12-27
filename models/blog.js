const mongoose = require("mongoose");

/**
 * @type {import('mongoose').Schema}
 */
const blogSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  url: String,
  likes: Number,
  comments: [{ message: String, date: Date }],
});

blogSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject.__v;
    delete returnedObject._id;

    if (returnedObject.comments) {
      returnedObject.comments = returnedObject.comments.map((comment) => {
        comment.id = comment._id.toString();
        delete comment._id;
        delete comment.__v;
        return comment;
      });
    }
  },
});

module.exports = mongoose.model("Blog", blogSchema);
