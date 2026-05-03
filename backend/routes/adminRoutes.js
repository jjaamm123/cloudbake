// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { 
    addMenuItem, 
    updateMenuItem, 
    deleteMenuItem, 
    getContactQueries 
} = require('../controllers/adminController');

// Define the API endpoints
router.post('/menu', addMenuItem);           // Add item
router.put('/menu/:id', updateMenuItem);     // Update item by ID
router.delete('/menu/:id', deleteMenuItem);  // Delete item by ID

router.get('/messages', getContactQueries);  // View messages

module.exports = router;