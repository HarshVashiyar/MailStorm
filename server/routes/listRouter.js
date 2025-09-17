const express = require('express');
const app = express.Router();
const {
    handleAddList,
    handleGetAllLists,
    handleGetListByID,
    handleUpdateList,
    handleRemoveLists
} = require('../controllers/listController');

app.get('/', (req, res) => {
    res.send('List Router');
});

app.get('/getall', handleGetAllLists);

app.get('/:id', handleGetListByID);

app.post('/add', handleAddList);

app.put('/update', handleUpdateList);

app.delete('/remove', handleRemoveLists);

module.exports = app;