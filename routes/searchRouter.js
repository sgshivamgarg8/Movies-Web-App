const express = require("express"),
router        = express.Router(),
config        = require("../config"),
request       = require("request")

tmdbApiKey = config.tmdbApiKey,
omdbApiKey = config.omdbApiKey;

router.get("/results", (req, res) => {
  let searchquery = req.query.searchquery;
  let url = `http://www.omdbapi.com/?apikey=${omdbApiKey}&s=${searchquery}`;
  request(url, (error, response, body) => {
      if(!error && response.statusCode == 200){
          let movies = JSON.parse(body);
          res.render("results", {movies: movies});
      }
  });
});

router.get("/moviedetails/:clickedmovieimdbid", (req, res) => {
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
      .on('data', (data) => {
          try {
              csvdata.push(data);
          }
          catch(err) {
              console.log(err);
          }
      })
      .on('end', () => {
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

module.exports = router;