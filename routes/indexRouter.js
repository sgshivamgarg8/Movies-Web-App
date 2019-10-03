const express = require("express"),
      router  = express.Router(),
      config  = require("../config"),
      request = require("request");

const tmdbApiKey = config.tmdbApiKey,
      omdbApiKey = config.omdbApiKey;

// Mounted at "/"

router.get("/", (req, res) => {
  let getTrendingUrl = `https://api.themoviedb.org/3/trending/movie/day?api_key=${tmdbApiKey}`;
  request(getTrendingUrl, (err, resp, body) => {
    data = JSON.parse(body);
    res.render("home", {movies: data.results});
  });
});

router.get("/popular/:page", (req, res) => {
  let page = parseInt(req.params.page);
  let getPopularUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${tmdbApiKey}&with_genres=${req.query.genre}&region=${req.query.region}&sort_by=popularity.desc&include_adult=false&include_video=false&page=${page}`;
  request(getPopularUrl, (err, resp, body) => {
    data = JSON.parse(body);
    res.render("popular", {movies: data.results, page: page, genre: req.query.genre, region: req.query.region, total_pages:parseInt(data.total_pages)});
  });
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