var mongoose = require("mongoose"),
		passportLocalMongoose = require("passport-local-mongoose")

var UserSchema = new mongoose.Schema({
	firstname: {
		type: String,
		default: '',
	},
	lastname: {
		type: String,
		default: '',
	},
	username: {
		type: String,
	},
	password: {
		type: String,
	},
	watchlist: []
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);