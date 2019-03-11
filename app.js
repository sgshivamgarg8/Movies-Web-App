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
        })
        .catch((err) => console.log(err));
    
    function getdetailsfromid(id){
        var urls = [];
        for(var i=0;i<id.length;i++){
            var url = "https://api.themoviedb.org/3/movie/" + id[i] + "?api_key=473523253ce1a6744f253c14043dec4f";
            urls.push(url);
            var options = {
                url: urls[i],
                json: true
            };
            var movie = [];
            rp(options)
                .then(function(data) {

                    movie.push({
                        imdbid: data.imdb_id,
                        title: data.title,
                        year: data.release_date.substring(0,4),
                        poster: "https://image.tmdb.org/t/p/w780" + data.poster_path,
                        overview: data.overview,
                        adult: data.adult 
                    });

                    if(movie.length == 20){
                        // console.log(movie);
                        res.render("home", {movie: movie});
                    }
                    // exports.movie = movie;

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
             res.render("moviedetails",{clickedmovie: clickedmovie})
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
app.listen(port, function(){
    console.log("Movie App has started on port: " + port);
});