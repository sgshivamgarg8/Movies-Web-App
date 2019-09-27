const express = require("express"),
      router  = express.Router(),
      config  = require("../config"),
      User    = require("../models/user");

const tmdbApiKey = config.tmdbApiKey,
      omdbApiKey = config.omdbApiKey;

router.get("/", (req, res) => {
  let user = req.user;
  // console.log(user.likeMovielist);
  
  let movies = [];
  if(user.likeMovielist.length) {
    for (let i=0; i<user.likeMovielist.length; i++) {
      let imdbId = user.likeMovielist[i].imdbId;
      // console.log(imdbId);
      let likeMovielistUrl = `http://www.omdbapi.com/?apikey=${omdbApiKey}&i=${imdbId}`;
      let options = {
        url: likeMovielistUrl,
        json: true
      };
      
      rp(options)
      .then((data) => {
        movies.push({imdbId: data.imdbID , title: data.Title, year: data.Year, poster: data.Poster, date: user.likeMovielist[i].createdAt});
        if(movies.length === user.likeMovielist.length) {
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

router.get("/addToLikeMovielist/:imdbId", (req, res) => {
  let user = req.user;
  let obtainedImdbId = req.params.imdbId;
  user.likeMovielist.push({imdbId: obtainedImdbId});
  user.save();
  res.redirect("/search/moviedetails/" + req.params.imdbId);
});

router.get("/removeFromLikeMovielist/:imdbId", (req, res) => {
  let user = req.user;
  let obtainedImdbId = req.params.imdbId;
  User.findByIdAndUpdate(user._id,
    {$pull: {likeMovielist: {imdbId: obtainedImdbId}}},
    {safe: true, upsert: true},
    (err, doc) => {
      if(err) console.log(err);
    }
  );
  res.redirect("/search/moviedetails/" + req.params.imdbId);
});
  
module.exports = router;