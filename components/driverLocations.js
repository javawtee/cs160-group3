const express = require("express");
const router = express.Router();

var driverLatLongs = [{"latitude":12,"longitude":13}];

router.post('/add', (req, res) => {
    var latitude = req.body.latitude;
	var longitude = req.body.longitude;
	var string = {"latitude":latitude,"longitude":longitude};
	driverLatLongs.push(string);
});

router.post('/retrieve', (req, res) => {
	var payload = {
          latitude : driverLatLongs[1].latitude,
          longitude: driverLatLongs[1].longitude
        }
        // else send default initialization of data
        res.json(payload);
});

module.exports = router;