# Movies-Web-App
## The Ultimate Movie Search Engine to Search for Movies and TV Series

* Install Node.js and MongoDB in your machine.
* Install all the npm packages required from dependencies in package.json using
  ```
  npm install
  ```
* Set Environment Variables for API keys using (optional)
  ```
  set TMDBAPIKEY="Your tmdb api key without quotes"
  set OMDBAPIKEY="Your omdb api key without quotes"
  ```
* Set Environemnt Variable for Database using (optional)
  ```
  set DATABASEURL="Your database url without quotes"
  ```
* Run app using 
  ```
  node app.js
  ```
  or
  ```
  npm start
  ```

### Note: To make an user admin you will have to change 'admin' property from false to true, manually using mongo client in terminal/cmd using commands
```
mongo
use moviesapp
db.users.update({username: 'user_name'}, {$set: {admin: true}})
```
