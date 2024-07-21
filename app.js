var express = require('express');
var bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');
const port = process.env.PORT || 3000;
const cors = require('cors');
const saltRounds = 10;
//Connect to Mysql
const db = require('./config/connection');
const { json } = require('body-parser');

const app = express();
app.use(bodyParser.json()); //Accespt json params
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'POST,GET DELETE, PUT');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(express.static(path.join(__dirname, '/public'), {index: 'login.html'}));


app.post('/api/register', async (req, res, next) => {
    var post_data = req.body; //get post params
     console.log(post_data);
    var username = req.body.email;
    var password= req.body.password;
    var passwordHash= await bcrypt.hash(password, saltRounds);
    
 try {
    db.query('SELECT * FROM Users WHERE username=?', [username], function (err, results, fields) {
        if (err) {
            console.log('MySQL ERROR', err);
        }
        if (results && results.length) {
            res.send({ msg: 'User already exists!!!' });
        } else {
            db.query("INSERT INTO `Users` (`username`,`password`) VALUES ( ?, ?)", [username, passwordHash], function (err, rows, fields) {
                if (err) {
                    console.log('MySQL ERROR', err);
                    res.send({ msg: "Could not register user ", status: 1 });
                } else {
                    res.send({ msg: "Succesfully registered", status: 0, rows: rows.length, data: rows });
                }
            });
        }
    });

} catch (err) {
    res.send({ msg: 'Something went wrong' + err, status: 2, err: err });
}

})

app.post('/api/login', (req, res, next) => {
    var post_data = req.body;
    console.log(post_data);

    var password = post_data.password;
    var username = post_data.email;

    try {
        db.query('Select * From users Where username=?', [username], async function (error, rows, fields) {
            if (error) {
                console.log(error);
            }
            if (rows.length > 0) {
                var encrypted_password = rows[0].password;
                var match = await verifyPassword(password, encrypted_password)
                console.log(match );
                if (match ) {
                    res.send({ msg: "You have logged in"});
                } else {
                    res.send({ msg: "Wrong password", status: 3 });
                }
            } else {
                res.send({ msg: "User does not exist or invalid email recieved", status: 2 });
            }
        });

    } catch (err) {
        res.send({ msg: 'Something went wrong' + err, status: 2 });
    }

});

async function verifyPassword(plainTextPassword, hash) {
    try {
        const match = await bcrypt.compare(plainTextPassword, hash);
        return match; // Returns true if the password matches, false otherwise
    } catch (err) {
        console.error('Error verifying password:', err);
        throw err;
    }
}

app.use(function(req, res) {
    res.status(400);
    return res.send(`404 Error: Resource not found`);
  });
  
  app.listen(port, () => {
    console.log(`App listening  on port ${port}`);
  })