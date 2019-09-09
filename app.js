var express = require("express"),
    app = express(),
    request = require("request"),
    bodyParser = require("body-parser"),
    flash = require("connect-flash");
    rp = require("request-promise"),
    fs = require('fs'),
    csv = require('csv-parser')
// ========================================
var mongoose = require("mongoose"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    session = require("express-session"),
    User = require("./models/user"),
    middleware = require("./middleware");
// ========================================

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(flash());

// ==================================================================================

const dbUrl = "mongodb://localhost:27017/moviesapp";
// const dbUrl = "mongodb+srv://shivam:shivam@cluster0-bfppm.mongodb.net/moviesapp?retryWrites=true&w=majority";

mongoose.connect(dbUrl, {useNewUrlParser: true});

app.use(session({
	secret: "Hello, This is my Secret Line",
	resave: false,
	saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

// =================================================================================


var options = {
    url: "https://api.themoviedb.org/3/trending/movie/day?api_key=473523253ce1a6744f253c14043dec4f",
    json: true
};

var movie = [];
var time = {}; //request optimization, will make new request after 1 hour
app.get("/", function(req, res){
    var t2 = new Date();
    var id = [];
    // console.log("movie length: ", movie.length);
    var timeTaken = (t2 - time.timeT1) / 1000;
    // console.log("timeTaken ", timeTaken);

    if(movie.length === 20 && timeTaken < 3600){
        res.render("home", {movie: movie}); // directly rendering movie data if data is requested recently
    }
    if(movie.length === 20 && timeTaken > 3600){
        movie = [];
    }
    if(movie.length === 0){
        rp(options)
        .then(function(data) {
            for(var i=0; i<data.results.length; i++){
                id.push(data.results[i].id);
            }
            getdetailsfromid(id);
        })
        .catch((err) => console.log(err));
    }
        
    function getdetailsfromid(id){
        var urls = [];
        for(var i=0; i<id.length; i++){
            var url = "https://api.themoviedb.org/3/movie/" + id[i] + "?api_key=473523253ce1a6744f253c14043dec4f";
            urls.push(url);
            var options = {
                url: urls[i],
                json: true
            };

            rp(options)
            .then(function(data) {
                // console.log("requesting data");
                movie.push({
                    imdbid: data.imdb_id,
                    title: data.title,
                    year: data.release_date.substring(0, 4),
                    poster: "https://image.tmdb.org/t/p/w780" + data.poster_path,
                    overview: data.overview,
                    adult: data.adult 
                });

                if(movie.length == 20){
                    // console.log(time);
                    time = {timeT1: new Date()}  // for request optimization
                    // console.log(time);
                    res.render("home", {movie: movie});
                }
            })
            .catch((err) => console.log(err));
        }
    }
});

app.get("/moviedetails/:clickedmovieimdbid", function(req, res){
    var clickedmovieimdbid = req.params.clickedmovieimdbid;

    var options = {
        url: "http://www.omdbapi.com/?apikey=8b0b451&i=" + clickedmovieimdbid,
        json: true
    }

    rp(options)
    .then(function(data){
        var clickedmovie = [];
            // console.log(data)
            clickedmovie.push({
                title: data.Title,
                year: data.Year,
                rated: data.Rated,
                released: data.Released,
                runtime: data.Runtime,
                genre: data.Genre,
                director: data.Director,
                writer: data.Writer,
                actors: data.Actors,
                plot: data.Plot,
                language: data.Language,
                country: data.Country,
                awards: data.Awards,
                poster: data.Poster,
                ratings: data.Ratings,
                metascore: data.Metascore,
                imdbrating: data.imdbRating,
                imdbvotes: data.imdbVotes,
                imdbid: data.imdbID,
                type: data.Type,
                dvd: data.DVD,
                boxoffice: data.BoxOffice,
                production: data.Production,
                website: data.Website,
            })

            var dict = {};
            var csvdata = [];
            fs.createReadStream("public/assets/Files/joined.csv")
            .pipe(csv())
            .on('data', function(data){
                try {
                    csvdata.push(data);
                }
                catch(err) {
                    console.log(err);
                }
            })
            .on('end',function(){
                    // console.log(csvdata);
                    for (var i=0; i<csvdata.length; i++){
                        dict[csvdata[i].imdbId] = csvdata[i].youtubeId;
                    } 
                    var trailerlink = dict[clickedmovie[0].imdbid.substring(2,).replace(/^0+/, '')];
                    res.render("moviedetails",{clickedmovie: clickedmovie, trailerlink: trailerlink}) 
                });
        });
});

app.get("/about", function(req, res){
    res.render("about");
});

app.get("/contact", function(req, res){
    res.render("contact");
});

app.get("/results", function(req, res){
    var searchquery = req.query.searchquery;
    url = "http://www.omdbapi.com/?apikey=8b0b451&s=" + searchquery;
    request(url, function(error, response, body){
        if(!error && response.statusCode == 200){
            var movies = JSON.parse(body);
            res.render("results", {movies: movies});
        }
    });
});

// ========================================================================
// AUTH ROUTES

app.get("/register", function(req, res){
	res.render("register");
});

app.post("/register", function(req, res){
	User.register(new User({username: req.body.username}), req.body.password, function(err, user){
		if(err){
            // console.log(err);
            req.flash("error", err.message);
			return res.redirect("/register");
        }
        if(req.body.firstname)
            user.firstname = req.body.firstname;
        if(req.body.lastname)
            user.lastname = req.body.lastname;
        user.save((err, user) => {
            if(err) console.log(err)
            else {
                passport.authenticate("local")(req, res, function(){
                    req.flash("success", "Successfully Signed Up as " + user.firstname + " " + user.lastname);
                    res.redirect("/");
                });
            }
        });
	});
});

app.get("/login", function(req, res){
	res.render("login");
});

app.post("/login", passport.authenticate("local", {
	successRedirect: "/",
	failureRedirect: "/login"
}));

app.get("/logout", middleware.isLoggedIn, function(req, res){
    req.logout();
    req.flash("success", "Successfully Logged Out");
	res.redirect("/");
});

// ========================================================================

app.get("*", function(req, res){
    res.send("<h1>Error 404!! Sorry, Page Not Found</h1>");
});

var port = process.env.PORT || 3000;
app.listen(port, function(){
    console.log("Movie App has started on port: " + port);
});