var jwt = require('jwt-simple');
var validateToken = require('../routes/auth').validateToken;
var User = require('../models/user');
module.exports = function(req, res, next) {

  //Expect for add User
  if(req.path == '/api/user/')
    return next();

  // When performing a cross domain request, you will recieve
  // a preflighted request first. This is to check if our the app
  // is safe. 

  // We skip the token outh for [OPTIONS] requests.
  //if(req.method == 'OPTIONS') next();

  var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
  var key = (req.body && req.body.x_key) || (req.query && req.query.x_key) || req.headers['x-key'];
  if (token || key) {
    try {
      var decoded = jwt.decode(token, require('../config/secret.js')());
      if (decoded.exp <= Date.now()) {
        res.status(400);
        res.json({
          "status": 400,
          "message": "Token Expired"
        });
        return;
      }

      // Authorize the user to see if s/he can access our resources
      var email = req.params.email;

      // Verification si le token correpond au token de la page de l'Utilisateur
      User.findOne({ 'email': email, 'token': token }, function ( err, user ) {
        if (user) {
          next(); // To move to next middleware
        } else {
          // No user with this name exists, respond back with a 401
          res.status(401);
          res.json({
            "status": 401,
            "message": "Page of other user"
          });
          return;
        }
      });

    } catch (err) {
      res.status(500);
      res.json({
        "status": 500,
        "message": "Oops something went wrong",
        "error": err
      });
    }
  } else {
    res.status(401);
    res.json({
      "status": 401,
      "message": "Invalid Token or Key"
    });
    return;
  }
};
