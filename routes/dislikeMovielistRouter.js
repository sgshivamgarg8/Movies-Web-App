const express = require("express"),
      router  = express.Router(),
      config  = require("../config"),
      User    = require("../models/user");

const tmdbApiKey = config.tmdbApiKey,
      omdbApiKey = config.omdbApiKey;

router.get("/", (req, res) => {
  let user = req.user;
  // console.log(user.dislikeMovielist);
  
  let movies = [];
  if(user.dislikeMovielist.length) {
    for (let i=0; i<user.dislikeMovielist.length; i++) {
      let imdbId = user.dislikeMovielist[i].imdbId;
      let dislikeMovielistUrl = `http://www.omdbapi.com/?apikey=${omdbApiKey}&i=${imdbId}`;
      let options = {
        url: dislikeMovielistUrl,
        json: true
      };
      
      rp(options)
      .then((data) => {
        movies.push({imdbId: data.imdbID , title: data.Title, year: data.Year, poster: data.Poster, date: user.likeMovielist[i].createdAt});
        if(movies.length === user.dislikeMovielist.length) {
          movies.sort((movie1, movie2) => {
            return (movie1.date > movie2.date ? -1 : 1);
          });
          res.render("list", {movies: movies});           
        }
      });
    }
  } else {
    res.render("list", {movies: movies});
  }
});

router.get("/addToDislikeMovielist/:imdbId", (req, res) => {
  let user = req.user;
  // console.log(user);
  let obtainedImdbId = req.params.imdbId;
  user.dislikeMovielist.push({imdbId: obtainedImdbId});
  user.save();
  res.redirect("/search/moviedetails/" + req.params.imdbId);
});

router.get("/removeFromDislikeMovielist/:imdbId", (req, res) => {
  let user = req.user;
  let obtainedImdbId = req.params.imdbId;
  User.findByIdAndUpdate(user._id,
    {$pull: {dislikeMovielist: {imdbId: obtainedImdbId}}},
    {safe: true, upsert: true},
    (err, doc) => {
      if(err) console.log(err);
    }
  );
  res.redirect("/search/moviedetails/" + req.params.imdbId);
});
  
module.exports = router;