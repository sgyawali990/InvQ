const Alert = require('../models/Alert');

const getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(alerts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch alerts' });
  }
};

const createAlert = async (req, res) => {
  try {
    const { itemId, message } = req.body;

    const alert = await Alert.create({
      itemId,
      message
    });

    res.status(201).json(alert);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create alert' });
  }
};

module.exports = {
  getAlerts,
  createAlert
};