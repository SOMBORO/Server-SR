var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var app = express();

app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.engine('html', require('ejs').renderFile);

app.use(session({secret: 'clientLogin'}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var con = mysql.createConnection({
    host: "srdb.cjerrqmoqokv.eu-west-1.rds.amazonaws.com",
    user: "bernard",
    password: "MAlolo1234",
    database: "srDB",
    port: "3306"
});

// var con = mysql.createConnection({
//     host: "localhost",
//     user: "root",
//     password: "",
//     database: "srDB"
// });

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

const port =3000;
app.listen(port,function(){
    console.log('Server started at port:'+port);
});

var sess;

app.get('/', function(req, res, next){
    sess = req.session;
    if(sess.cin){
        res.redirect('/index');
    }else{
        res.render('login.ejs', {erreur: "false"});
    }
});

app.get('/login', function(req, res){
    res.render('login.ejs', {erreur: "false"});
});

app.get('/signin', function(req, res){
    res.render('signin.ejs');
})

app.get('/logout',function(req,res){
    req.session.destroy(function(err) {
      if(err) {
        console.log(err);
      } else {
        res.redirect('/');
      }
    });
});

app.get('/index', function(req, res, next){
    sess = req.session;
    if(sess.cin){
        res.render('index.ejs', {name: sess.name});
    }else{
        res.redirect('/');
    }
});

app.get('/clients', function(req, res){
    sess = req.session;
    if(sess.cin){
        con.query("SELECT * FROM clients", function(err, result, fields){
            if(err) throw err;
            res.render('list.ejs', {clients: result});
        })
    }else{
        res.redirect('/login');
    }
})

app.post('/login', function(req, res){
    var sql = 'SELECT * FROM clients WHERE cin = ? AND password = ?';
    con.query(sql, [Number(req.body.cin), req.body.password], function (err, result, fields) {
        if (err) throw err;
        if(result[0]){
            console.log(result);
            sess = req.session;
            sess.cin = req.body.cin;
            sess.name = result[0].name;
            
            res.redirect('/index');
        }
        else{
            res.render('login.ejs', {erreur: "true"});
        }
    });
});

app.post('/create', function(req, res){
    var sql = "INSERT INTO clients(cin, name, password) VALUES("+req.body.cin+", '"+req.body.name+"', '"+req.body.password+"')";
    
    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        console.log("Success !");
        res.redirect('/login');
    });
});

app.get('*', function(req, res){
    res.render('404.ejs');
});