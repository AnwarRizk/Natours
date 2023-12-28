const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minLength: 8,
    select: false // This will never show up in any output
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!'
    }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean, // This will be used for deleting users
    default: true,
    select: false // This will never show up in any output
  }
});

userSchema.pre('save', async function (next) {
  // If the password was not modified, then we don't want to do anything
  if (!this.isModified('password')) return next();

  // If the password was modified, then we want to hash the password
  // The 12 is the cost parameter. The higher the cost, the more CPU power is needed to calculate the hash
  // We use 12 because it's a good balance between security and performance
  this.password = await bcrypt.hash(this.password, 12);

  // We don't want to persist the passwordConfirm field to the database
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  // If the password was not modified or the document is new, then we don't want to do anything
  if (!this.isModified('password') || this.isNew) return next();

  // We need to subtract 1 second from the passwordChangedAt field because sometimes the token is created before the password is changed
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// This is a query middleware that will run before any find query is executed
userSchema.pre(/^find/, function (next) {
  // this points to the current query
  // We only want to find users that have the active property set to true
  this.find({ active: { $ne: false } });
  next();
});

// This is an instance method that will be available on all documents in a certain collection
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  // We need to use bcrypt because the password is hashed
  // Return true if the password is correct, otherwise return false
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    // Convert the passwordChangedAt date to a timestamp in seconds
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    // If the password was changed after the token was issued, then we want to return true
    return JWTTimestamp < changedTimestamp;
  }
  // If the password was never changed, then we want to return false
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  // Create a random string
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Encrypt the random string
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  //console.log({ resetToken }, this.passwordResetToken);
  // Set the passwordResetExpires field to 10 minutes
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // Return the unencrypted random string
  return resetToken;
};

// Create a model out of the schema
const User = mongoose.model('User', userSchema);

module.exports = User;
