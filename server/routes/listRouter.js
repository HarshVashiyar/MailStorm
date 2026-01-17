const express = require('express');
const app = express.Router();
const {
    handleAddList,
    handleGetAllLists,
    handleAddItemsToList,
    handleRemoveItemsFromList,
    handleRemoveLists
} = require('../controllers/listController');
const { authenticateUser } = require("../utilities/userUtil");

app.get('/', (req, res) => {
    res.send('Welcome to List Router!');
});

app.get('/getall', authenticateUser, handleGetAllLists);

app.post('/add', authenticateUser, handleAddList);

app.put('/additems', authenticateUser, handleAddItemsToList);

app.put('/removeitems', authenticateUser, handleRemoveItemsFromList);

app.delete('/remove', authenticateUser, handleRemoveLists);

module.exports = app;