const express = require("express"),
app = express(),
request = require("request"),
bodyParser = require("body-parser"),
flash = require("connect-flash");
rp = require("request-promise"),
fs = require('fs'),
csv = require('csv-parser')
// ========================================
const mongoose = require("mongoose"),
passport = require("passport"),
LocalStrategy = require("passport-local"),
session = require("express-session"),
User = require("./models/user"),
middleware = require("./middleware");
// ========================================

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(flash()); //for flash messages

// ==================================================================================

const dbUrl = process.env.DBURL || "mongodb://localhost:27017/moviesapp";

mongoose.connect(dbUrl, {useNewUrlParser: true, useFindAndModify: false});

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

const tmdbApiKey = process.env.TMDBAPIKEY || "473523253ce1a6744f253c14043dec4f";
const omdbApiKey = process.env.OMDBAPIKEY || "8b0b451";

var options = {
    url: `https://api.themoviedb.org/3/trending/movie/day?api_key=${tmdbApiKey}`,
    json: true
};

var movie = [];
var time = {}; //request optimization, will make new request after 1 hour
app.get("/", function(req, res){
    
    var t2 = new Date();
    let id = [];
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
            for(let i=0; i<data.results.length; i++){
                id.push(data.results[i].id);
            }
            getdetailsfromid(id);
        })
        .catch((err) => console.log(err));
    }
    
    function getdetailsfromid(id){
        let urls = [];
        for(let i=0; i<id.length; i++){
            let url = `https://api.themoviedb.org/3/movie/${id[i]}?api_key=${tmdbApiKey}`;
            urls.push(url);
            let options = {
                url: urls[i],
                json: true
            };
            
            rp(options)
            .then(function(data) {
                movie.push({
                    imdbid: data.imdb_id,
                    title: data.title,
                    year: data.release_date.substring(0, 4),
                    poster: "https://image.tmdb.org/t/p/w780" + data.poster_path,
                    overview: data.overview,
                    adult: data.adult 
                });
                
                if(movie.length == 20){
                    time = {timeT1: new Date()}  // for request optimization
                    res.render("home", {movie: movie});
                }
            })
            .catch((err) => console.log(err));
        }
    }
});

app.get("/results", function(req, res){
    let searchquery = req.query.searchquery;
    let url = `http://www.omdbapi.com/?apikey=${omdbApiKey}&s=${searchquery}`;
    request(url, function(error, response, body){
        if(!error && response.statusCode == 200){
            let movies = JSON.parse(body);
            res.render("results", {movies: movies});
        }
    });
});

app.get("/moviedetails/:clickedmovieimdbid", function(req, res){
    let clickedmovieimdbid = req.params.clickedmovieimdbid;
    
    if(req.user) {
        let watchlist = req.user.watchlist;
        var foundInWatchlist = false;
        // console.log("watchlist", watchlist);
        for (let i=0; i<watchlist.length; i++){
            let imdbId = watchlist[i].imdbId;
            if(imdbId === clickedmovieimdbid) {
                foundInWatchlist = true;
                break;
            }
        }
        // console.log(foundInWatchlist); 
    }

    // Function to Convert Runtime from Minutes to Hours:Minutes
    function convertRuntime(a) {
        let hours = Math.trunc(a/60);
        let minutes = a % 60;
        let time;
        if(hours != 0 && minutes != 0) {
            time = hours + "h " + minutes + "min";
        } else if(hours == 0) {
            time = minutes + "min";
        } else if(minutes == 0) {
            time = hours + "h ";
        }
        return time;
    }
    
    let options = {
        url: `http://www.omdbapi.com/?apikey=${omdbApiKey}&i=${clickedmovieimdbid}`,
        json: true
    }
    
    rp(options)
    .then((data) => {
        let clickedmovie = [];
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
        
        let dict = {};
        let csvdata = [];
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
            for (let i=0; i<csvdata.length; i++){
                dict[csvdata[i].imdbId] = csvdata[i].youtubeId;
            } 
            let trailerlink = dict[clickedmovie[0].imdbid.substring(2,).replace(/^0+/, '')];
            res.render("moviedetails", {
                clickedmovie: clickedmovie, 
                trailerlink: trailerlink,
                display: convertRuntime,
                found: foundInWatchlist
            });
        });
    })
    .catch((err) => console.log(err));
});

// Watchlist Routes ====================================================================

app.get("/addToWatchlist/:imdbId", middleware.isLoggedIn, (req, res) => {
    let user = req.user;
    let obtainedImdbId = req.params.imdbId;
    user.watchlist.push({imdbId: obtainedImdbId});
    user.save();
    res.redirect("/moviedetails/" + req.params.imdbId);
});

app.get("/removeFromWatchlist/:imdbId", middleware.isLoggedIn, (req, res) => {
    let user = req.user;
    let obtainedImdbId = req.params.imdbId;
    User.findByIdAndUpdate(user._id,
        {$pull: {watchlist: {imdbId: obtainedImdbId}}},
        {safe: true, upsert: true},
        function(err, doc) {
            if(err) console.log(err);
        }
    );
    res.redirect("/moviedetails/"+req.params.imdbId);
});

app.get("/mywatchlist", middleware.isLoggedIn, (req, res) => {
    let user = req.user;
    // console.log(user.watchlist);
    
    let movies = [];
    if(user.watchlist.length) {
        for (let i=0; i<user.watchlist.length; i++) {
            let imdbId = user.watchlist[i].imdbId;
            // console.log(imdbId);
            let watchlistUrl = `http://www.omdbapi.com/?apikey=${omdbApiKey}&i=${imdbId}`;
            let options = {
                url: watchlistUrl,
                json: true
            };

            rp(options)
            .then((data) => {
                movies.push({imdbId: data.imdbID , title: data.Title, year: data.Year, poster: data.Poster, date: user.watchlist[i].createdAt});
                if(movies.length === user.watchlist.length) {
                    movies.sort((movie1, movie2) => {
                        return (movie1.date > movie2.date ? -1 : 1);
                    });
                    res.render("watchlist", {movies: movies});           
                }
            });
        }
    } else {
        res.render("watchlist", {movies: movies});
    }
});

// /Watchlist Routes ====================================================================


app.get("/about", function(req, res){
    res.render("about");
});

app.get("/contact", function(req, res){
    res.render("contact");
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
            if(err) console.log(err);
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

app.post("/login", function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) { 
            req.flash("error", err);
            return res.redirect('/login');
        } if (!user) { 
            req.flash("error", info.message);
            return res.redirect('/login');
        }
        req.logIn(user, function(err) {
            if (err) {
                req.flash("error", err);                 
                return res.redirect('/login');
            }
            req.flash("success", "Successfully Signed In as " + user.firstname + " " + user.lastname);
            return res.redirect("/");  //temporarily changed
        });
    })(req, res, next);
});

app.get("/logout", middleware.isLoggedIn, function(req, res){
    req.logout();
    req.flash("success", "Successfully Logged Out");
    res.redirect("/");
});

// ========================================================================

app.get("*", function(req, res){
    res.send("<h1>Error 404!! Sorry, Page Not Found</h1>");
});

let port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Movie App has started on port: ${port}`));