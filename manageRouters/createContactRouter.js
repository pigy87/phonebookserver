const express = require('express');
const createcontactRouter = express.Router();


const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./phonebook.sqlite');


createcontactRouter.post("/", (req, res, next) => {
    console.log(req.user)
    console.log(req.userId)
    console.log(req.body)

    let contactName = req.body.contactName;
    let contactSurname = req.body.contactSurName;
    let contactEmail = req.body.contactEmail;
    let contactNumbers = req.body.contactNumbers;

    let contactIdForOverwrite = null;
    let overWrite = req.body.overWrite;
    let saveAnyway = req.body.saveAnyway;


    let sqlCreateContactsOfIdtable = `CREATE TABLE IF NOT EXISTS ContactsOfId_${req.userId} (
            ContactId INTEGER PRIMARY KEY,
            ContactName TEXT NOT NULL , 
            ContactSurname TEXT ,
            ContactEmail TEXT ,
            ContactsOwnerId INTEGER NOT NULL,
            FOREIGN KEY (ContactsOwnerId) REFERENCES Userdata(id));`;

    let sqlInsertContactInTable = `INSERT INTO ContactsOfId_${req.userId}(ContactName,ContactSurname,ContactEmail,ContactsOwnerId) 
        VALUES("${contactName}","${contactSurname}","${contactEmail}",${req.userId});`;

    let sqlCreateNumbersTable = `CREATE TABLE IF NOT EXISTS Numbers (
            NumberId INTEGER PRIMARY KEY,
            NumberType TEXT,
            Number INTEGER,
            ContactBelognsToId INTEGER,
            FOREIGN KEY (ContactBelognsToId) REFERENCES ContactsOfId_${req.userId}(ContactId)
            )`;

    function writeNumbersInTable(contactId, contactNumbers) {
        contactNumbers.forEach(element => {
            let sql = `INSERT INTO Numbers( NumberType,Number,ContactBelognsToId) VALUES("${element.typeOfNumber}",${element.number},${contactId});`;
            return db.run(sql, (err) => {
                if (err) {
                    console.log(err);
                }
            })
        });
    };


    db.get(`SELECT * FROM ContactsOfId_${req.userId} WHERE ContactName="${contactName}"`, function(err, contact) {
        if (!saveAnyway && contact) {

            if (overWrite) {
                console.log('overWrite CONTACT');
                console.log(contact);
                db.serialize(() => {
                    db.run(`UPDATE ContactsOfId_${req.userId} SET ContactName="${contactName}",ContactSurname="${contactSurname}",ContactEmail="${contactEmail}" WHERE ContactId=${contact.ContactId};`, (err) => {
                        if (err) {
                            console.log(`ser1` + err)
                            return
                        }

                    });

                    db.run(`DELETE FROM Numbers WHERE ContactBelognsToId=${contact.ContactId};`, (err) => {
                        if (err) {
                            console.log(`errNumbers` + err);
                        } else {
                            console.log(`brojevi izbrsiani`);
                        }
                    })

                    writeNumbersInTable(contact.ContactId, contactNumbers)
                    res.status(200).send({ response: 'successful overwrite' })
                })


            } else {
                res.status(400).send({ response: "userAlreadyExist" })
            }
        } else {
            console.log('save');

            db.run(sqlCreateContactsOfIdtable, (err) => {
                if (err) {
                    console.log("Eror1:" + err);
                    res.status(500).send()
                    return
                }
                db.run(sqlInsertContactInTable, function(err) {
                    if (err) {
                        console.log("Eror2:" + err);
                    }
                    let contactId = this.lastID;
                    db.run(sqlCreateNumbersTable, (err) => {
                        if (err) {
                            console.log("Eror3:" + err);
                        }
                        writeNumbersInTable(contactId, contactNumbers);
                        res.status(201).send({ response: 'contact saved' })
                    });
                });
            });
        }

    })


})

module.exports = createcontactRouter;