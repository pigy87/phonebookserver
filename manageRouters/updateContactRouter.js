const express = require('express');
const updatecontactRouter = express.Router();


const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./phonebook.sqlite');

updatecontactRouter.post("/", (req, res, next) => {
    console.log('updatecontactRouter');
})


module.exports = updatecontactRouter;