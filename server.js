const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const errorhandler = require('errorhandler')
const bodyParser = require('body-parser');
const api = express();
let createcontactRouter = require('./manageRouters/createContactRouter');
const multer = require('multer');
const PORT = 4000;
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./phonebook.sqlite');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const config = require('./config.json');
const secret = config.ACCESS_TOKEN_SECRET;

function authenticateToken(req, res, next) {
    const token = req.headers['bearer'];
    if (token == null) {
        return res.sendStatus(401)
    }
    jwt.verify(token, secret, (err, user) => {
        if (err) {
            return res.sendStatus(403)
        }
        req.user = user.userName;
        db.get(`SELECT * FROM Userdata WHERE userName="${user.userName}";`, function(err, data) {
            if (err) {
                console.log(err)
            }

            req.userId = data.id
            next();
        });

    })
}


var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './imagesUsers')
    },
    filename: function(req, file, cb) {

        cb(null, file.originalname);
    }
})

const upload = multer({ storage: storage });

function errorNotification(err, str, req) {
    return str
}
api.use(errorhandler({ log: errorNotification }));
api.use(morgan('dev'));
api.use(cors({ origin: "http://localhost:3000" }));
api.use(bodyParser.json());
api.use(bodyParser.urlencoded({ extended: true }))
api.use(cookieParser());





api.post(`/login`, async(req, res, next) => {

    let userName = req.query.userName;
    let userPassword = req.query.userPassword;

    const user = {
        userName: userName
    };
    const token = jwt.sign(user, secret, { expiresIn: "2h" });
    console.log(token)



    db.get(`SELECT * FROM Userdata WHERE userName="${userName}";`, function(err, user) {
        if (err) {
            console.log(err)
        }

        bcrypt.compare(userPassword, user.userPassword).then(
            function(result) {
                if (result) {

                    res.status(200).send({
                        answer: "user is logged in",
                        token: token
                    })

                } else {
                    res.status(401).send({ answer: 'Wrong user name or password' })
                }
            });
    });


});


api.post('/newmember', upload.single('avatar'), async(req, res, next) => {
    console.log(req.file)
    console.log(req.body)
    let userName = req.body.userName;
    let userPassword = req.body.userPassword;
    let age = req.body.userAge;
    let userPicturepath = req.file.path;
    let hashedPassword = await bcrypt.hash(userPassword, 10);
    try {
        db.get(`SELECT * FROM UserData WHERE userName="${userName}";`, function(err, row) {
            if (err) {
                next(err);
            } else if (row) {
                res.status(400).send('userName is Taken')
            } else {

                db.run(`INSERT INTO Userdata(userName,userPassword,age,picture) VALUES("${userName}","${hashedPassword}",${age},"${userPicturepath}");`, function(err) {
                    if (err) {
                        next(err);
                    }
                    res.status(201).redirect('http://localhost:3000/login')
                });
            }
        });
    } catch {
        res.redirect('http://localhost:3000/newmember')
    }

});

api.use('/createcontact', authenticateToken, createcontactRouter)



api.listen(PORT, (err) => {
    if (err) {
        console.log(err)
    } else {
        console.log('Server listen at port ' + PORT)
    }
});