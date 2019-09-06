var mongoose = require("mongoose"),
passportLocalMongoose = require("passport-local-mongoose")

var UserSchema = new mongoose.Schema({
	firstname: {
		type: String,
		default: '',
		// required: true
	},
	lastname: {
		type: String,
		default: '',
		// required: true
	},
	username: {
		type: String,
	},
	password: {
		type: String,
	}
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);