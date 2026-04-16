const Item = require('../models/Item');
const Alert = require('../models/Alert');
const { sendLowStockAlert, sendOutOfStockAlert } = require('../utils/email');
const User = require('../models/User');

// VALIDATION
const validateItemInput = ({ itemName, quantity, reorderThreshold }) => {
  if (!itemName || typeof itemName !== 'string' || itemName.trim() === '') {
    return 'itemName is required and must be a non-empty string';
  }

  if (quantity === undefined || isNaN(quantity) || Number(quantity) < 0) {
    return 'quantity must be a number >= 0';
  }

  if (reorderThreshold === undefined || isNaN(reorderThreshold) || Number(reorderThreshold) < 0) {
    return 'reorderThreshold must be a number >= 0';
  }

  return null;
};

// ALERT HELPER
const checkAndNotify = async (item) => {
  try {
    if (item.quantity <= item.reorderThreshold) {
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;
      if (item.lastAlertSentAt && (now - new Date(item.lastAlertSentAt).getTime()) < fiveMinutes) {
        return;
      }

      await Alert.create({
        itemId: item._id,
        user: item.user,
        message: `${item.itemName} is low on stock (${item.quantity})`
      });

      const user = await User.findById(item.user);
      if (user?.email) {
        if (item.quantity === 0) {
          await sendOutOfStockAlert(user.email, item.itemName);
        } else {
          await sendLowStockAlert(user.email, item.itemName, item.quantity);
        }
      }
    
      await Item.updateOne({ _id: item._id }, { lastAlertSentAt: new Date() });
    }
  } catch (err) {
    console.error("Alert creation failed:", err);
  }
};

// CREATE 
const createItem = async (req, res) => {
  try {
    const { itemName, quantity, reorderThreshold } = req.body;

    const validationError = validateItemInput({ itemName, quantity, reorderThreshold });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const item = await Item.create({
      itemName: itemName.trim(),
      quantity: Number(quantity),
      reorderThreshold: Number(reorderThreshold),
      user: req.user.id
    });

    await checkAndNotify(item);

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET ALL 
const getItems = async (req, res) => {
  try {
    const items = await Item.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET ONE
const getItemById = async (req, res) => {
  try {
    const item = await Item.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// UPDATE 
const updateItem = async (req, res) => {
  try {
    const { itemName, quantity, reorderThreshold } = req.body;

    const item = await Item.findOne({ _id: req.params.id, user: req.user.id });
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (itemName !== undefined) {
      if (typeof itemName !== "string" || itemName.trim() === "") {
        return res.status(400).json({ message: "itemName must be a non-empty string" });
      }
      item.itemName = itemName.trim();
    }

    if (quantity !== undefined) {
      if (isNaN(quantity) || Number(quantity) < 0) {
        return res.status(400).json({ message: "quantity must be >= 0" });
      }
      item.quantity = Number(quantity);
    }

    if (reorderThreshold !== undefined) {
      if (isNaN(reorderThreshold) || Number(reorderThreshold) < 0) {
        return res.status(400).json({ message: "reorderThreshold must be >= 0" });
      }
      item.reorderThreshold = Number(reorderThreshold);
    }

    await item.save();
    await checkAndNotify(item);

    res.status(200).json(item);
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, user: req.user.id });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    await item.deleteOne();
    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// EXPORT 
module.exports = {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem
};