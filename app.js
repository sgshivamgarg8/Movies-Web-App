var express = require("express");
var app = express();
var request = require("request");
var rp = require("request-promise");

app.set("view engine", "ejs");
app.use(express.static("public"));

var options = {
    url: "https://api.themoviedb.org/3/trending/movie/day?api_key=473523253ce1a6744f253c14043dec4f",
    json: true
};

app.get("/",function(req, res){
    var id = [];
    rp(options)
        .then(function(data) {
            for(var i=0;i<data.results.length;i++){
                id.push(data.results[i].id);
            }
            getdetailsfromid(id);
        });
    
    function getdetailsfromid(id){
        var urls = [];
        var imdbid = [];
        var titles = [];
        var posters = [];
        for(var i=0;i<id.length;i++){
            var url = "https://api.themoviedb.org/3/movie/" + id[i] + "?api_key=473523253ce1a6744f253c14043dec4f";
            urls.push(url);
            var options = {
                url: urls[i],
                json: true
            };

            rp(options)
                .then(function(data) {
                    imdbid.push(data.imdb_id);
                    titles.push(data.title);
                    posters.push("https://image.tmdb.org/t/p/w780" + data.poster_path);

                    if(titles.length == 20){
                        res.render("home", {
                            titles: titles,
                            imdbid: imdbid,
                            posters: posters
                        });
                    }
                })
                .catch(function(err) {console.log(err);});
        }
    }
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