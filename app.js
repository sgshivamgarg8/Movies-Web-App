var express = require("express");
var app = express();
var request = require("request");

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/",function(req, res){
    var url = "https://api.themoviedb.org/3/trending/movie/day?api_key=473523253ce1a6744f253c14043dec4f";

    request(url, function(error,response,body){
        if(!error && response.statusCode==200){
            var trendingmovie = JSON.parse(body);
            res.render("home", {trendingmovie: trendingmovie});
        }
    });
});

app.get("/about",function(req, res){
    res.render("about");
});

app.get("/contact",function(req, res){
    res.render("contact");
});

app.get("/results",function(req, res){
    var searchquery = req.query.searchquery;
    url = "http://www.omdbapi.com/?apikey=8b0b451&s=" + searchquery;
    request(url, function(error,response,body){
        if(!error && response.statusCode==200){
            var movies = JSON.parse(body);
            res.render("results", {movies: movies});
        }
    });
});

app.get("*", function(req, res){
    res.send("Error!! Sorry, Page Not Found");
});

var port = process.env.PORT || 3000;
app.listen(port, function(req, res){
    console.log("Movie App has started on port: " + port);
});