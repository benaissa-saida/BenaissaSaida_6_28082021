const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

/* La valeur unique de notre email avec uniqueValidator passé comme plug-in
s'assurera que deux user ne peuvent pas partager le même email*/

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
