const express = require("express"),
      router  = express.Router(),
      config  = require("../config"),
      request = require("request")

const tmdbApiKey = config.tmdbApiKey,
      omdbApiKey = config.omdbApiKey;

var movie = [];
var time = {}; //request optimization, will make new request after 1 hour (3600 seconds)
router.get("/", (req, res) => {
  var t2 = new Date();
  let id = [];
  var timeTaken = (t2 - time.timeT1) / 1000;
  
  if(movie.length === 20 && timeTaken < 3600){
    res.render("home", {movie: movie}); // directly rendering movie data if data is requested recently
  }
  if(movie.length === 20 && timeTaken > 3600){
    movie = [];
  }
  if(movie.length === 0){
    let options = {
      url: `https://api.themoviedb.org/3/trending/movie/day?api_key=${tmdbApiKey}`,
      json: true
    };

    rp(options)
    .then((data) => {
      for(let i=0; i<data.results.length; i++){
        id.push(data.results[i].id);
      }
      getDetailsFromId(id);
    })
    .catch((err) => console.log(err));
  }
  
  function getDetailsFromId(id){
    let urls = [];
    for(let i=0; i<id.length; i++){
      let url = `https://api.themoviedb.org/3/movie/${id[i]}?api_key=${tmdbApiKey}`;
      urls.push(url);
      let options = {
        url: urls[i],
        json: true
      };
      
      rp(options)
      .then((data) => {
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

router.get("/popular", (req, res) => {
  let getPopularUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${tmdbApiKey}&with_genres=${req.query.genre}&region=${req.query.region}&sort_by=popularity.desc&include_adult=false&include_video=false&page=1`;
  request(getPopularUrl, (err, resp, body) => {
    data = JSON.parse(body);
    res.render("popular", {movies: data.results});
  })
});

router.get("/getImdbIdofClickedMovie/:tmdbId", (req, res) => {
  let id = req.params.tmdbId;
  let url = `https://api.themoviedb.org/3/movie/${id}?api_key=${tmdbApiKey}`;
  request(url, (err, resp, body) => {
    let data = JSON.parse(body);
    let redirectUrl = `/search/moviedetails/${data.imdb_id}`;
    res.redirect(redirectUrl);
  });
});

router.get("/about", (req, res) => {
  res.render("about");
});

router.get("/contact", (req, res) => {
  res.render("contact");
});

module.exports = router;