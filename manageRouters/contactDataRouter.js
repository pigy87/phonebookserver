const express = require('express');
const contactdataRouter = express.Router();


const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./phonebook.sqlite');

contactdataRouter.get("/", (req, res, next) => {
    console.log('get all contactDataRouter');
    db.all(`SELECT * FROM ContactsOfId_${req.userId};`, function(err, contacts) {
        if (err) {
            console.log(err);
        } else {
            res.status(200).send({ contacts: contacts })
        }
    })
})

contactdataRouter.get("/:id", (req, res, next) => {
    console.log('get byId contactDataRouter');

    console.log(req.params.id);

    db.get(`SELECT * FROM ContactsOfId_${req.userId} WHERE ContactId=${req.params.id};`, function(err, contact) {
        if (err) {
            console.log(err);
        } else {
            db.all(`SELECT * FROM Numbers WHERE ContactBelognsToId=${req.params.id};`, function(err, numbers) {
                if (err) {
                    console.log(err);
                } else {
                    res.status(200).send({ data: [contact, numbers] })
                }
            })

        }
    })


})





module.exports = contactdataRouter;