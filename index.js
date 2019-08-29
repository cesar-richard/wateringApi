var express = require("express");
var hostname = "localhost";
var port = 8080;
var mongoose = require("mongoose");
var options = { useNewUrlParser: true };
var urlmongo = "mongodb://root:example@localhost/watering";
mongoose.connect(urlmongo, options);
var db = mongoose.connection;
db.on("error", console.error.bind(console, "Erreur lors de la connexion"));
db.once("open", function() {
  console.log("Connexion à la base OK");
});
var app = express();
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var wateringSchema = mongoose.Schema({
  createdAt: { type: Date, default: Date.now },
  consumedAt: { type: Date, default: null },
  quantity: { type: Number, default: 3000 },
  consumed: { type: Boolean, default: false },
  device: String
});
var Watering = mongoose.model("Watering", wateringSchema);
var myRouter = express.Router();
myRouter
  .route("/")
  .get(function(req, res) {
    Watering.find(function(err, w) {
      if (err) {
        res.send(err);
      }
      res.json(w);
    });
  })
  .post(function(req, res) {
    var w = new Watering();
    w.nom = req.body.nom;
    w.save(function(err) {
      if (err) {
        res.send(err);
      }
      res.json({ data: w });
    });
  });

myRouter
  .route("/waterings/:watering_id")
  .get(function(req, res) {
    Watering.findById(req.params.watering_id, function(err, w) {
      if (err) res.send(err);
      res.json(w);
    });
  })
  .put(function(req, res) {
    Watering.findById(req.params.watering_id, function(err, w) {
      if (err) {
        res.send(err);
      }
      w.device = req.body.device;
      w.quantity = req.body.quantity;
      w.save(function(err) {
        if (err) {
          res.send(err);
        }
        res.json({ data: w });
      });
    });
  })
  .delete(function(req, res) {
    Watering.remove({ _id: req.params.watering_id }, function(err, w) {
      if (err) {
        res.send(err);
      }
      res.json({ data: w });
    });
  });

myRouter.route("/consume").get((req, res) => {
  var query = Watering.find({ consumed: false });
  query.exec(function(err, w) {
    if (err) res.send(err);
    if (w.length > 0) {
      res.status(418);
      w[0].consumed = true;
      w[0].consumedAt = Date.now();
      w[0].save();
      res.send(w[0]);
    } else {
      res.status(410);
      res.send({});
    }
  });
});

app.use(myRouter);
app.listen(port, hostname, function() {
  console.log("Listening on  http://" + hostname + ":" + port);
});
