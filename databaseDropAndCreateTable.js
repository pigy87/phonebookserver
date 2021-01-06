const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./phonebook.sqlite');


db.run(`DROP TABLE IF EXISTS Userdata`, (err) => {
    if (err) {
        console.log(err)
    }
});

db.run(`CREATE TABLE Userdata (
        id INTEGER PRIMARY KEY,
        userName TEXT Required,
        userPassword INTEGER Required,
        age INTEGER Rquired,
        picture TEXT )`, (err) => {
    if (err) {
        console.log(err);
    }
});