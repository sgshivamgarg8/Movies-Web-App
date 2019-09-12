const mongoose = require("mongoose"),
passportLocalMongoose = require("passport-local-mongoose")

var watchlistSchema = new mongoose.Schema({
	imdbId: String,
}, {
	timestamps: true
});

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
	watchlist: [watchlistSchema]
}, {
	timestamps: true
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);