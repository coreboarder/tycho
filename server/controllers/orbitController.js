var orbitModel = require('../models/orbitModel.js');

module.exports = {

  getVehicleTrajectory: function (req, res) {
    orbitModel.getVehicleTrajectory(req.params.vehicleID, function (err, trajectory) {
    if (err) {
      console.error(err);
      res.status(404).send(err);
    } else {
      res.status(200).json(trajectory);
    });
  }
  
}