// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'espnstar',
  database : 'greapp'
});

var cors = require('cors');
var engines = require('consolidate');
// use it before all route definitions


var app        = express();                 // define our app using express

var bodyParser = require('body-parser');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
var port = process.env.PORT || 8080;        // set our port

/*app.use(express.static(__dirname + '/app'));
app.engine('html', engines.underscore);

app.set('views', __dirname + '/app/views');
app.set('view engine', 'html');
*/

app.use(express.static(__dirname + '/app'));

app.engine('html',engines.underscore);
/*
 Set views direcoctory. DO NOT set this with the static directory!. 
*/
app.set('views', __dirname+'/app/views');
app.set('view engine', 'html');


// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

connection.connect(function(err){
	if(!err){
		console.log("Database is connected");
	}else{
		console.log("Database is not connected");
	}
});


router.get("/",function(req,res){
	console.log("index page requested");
	res.render('index', {message:''});
});


router.post('/login',function(req,res){
	var username = JSON.stringify(req.body.uname);
	var password = req.body.pwd;
	console.log('username: '+username);
	console.log('passowrd: '+password);
	var encryptedPassword = JSON.stringify(encrypt(password));
	console.log(encryptedPassword);
	//res.setHeader("Content-Type", "application/json");
	connection.query('select username from user_master where username='+username+' and password = '+encryptedPassword ,function(err,rows,fields){
		if(!err){
			//var result = JSON.stringify(rows);
			console.log(JSON.stringify(rows));
			//res.send(JSON.stringify("{'username' : 'tk'}"));
			//res.send(JSON.stringify(rows));
			 //res.contentType('json');
			 //res.writeHead(200, { 'Content-Type': 'application/json' }); 
			 res.send(rows);
			 //res.redirect('./themes');
			 //res.render('web/themes.html',{'user': username});	
			/* res.render('user/home', {
                user:username,
                title:'node'
            });*/

		}else{
			console.log(err);
			res.send(err);
		}


	});
});

router.post('/register',function(req,res){
	var uname = req.body.uname;
	var pwd = req.body.pwd;
	var email = req.body.email;
	var fname = req.body.fname;
	var lname = req.body.lname
	var bdate = req.body.birthdate;
	//console.log('username: '+uname);
	//console.log('passowrd: '+pwd);
	var userid = -1;

	var encryptedPassword = encrypt(pwd);
	console.log(encryptedPassword);
	var post = { username:  uname, password:encryptedPassword, created_by:'-1',last_updated_by: '-1',creation_date: new Date(), last_updated_date: new Date() }
	connection.query('insert into user_master set ?',post,function(err,rows,fields){
		if(!err)
		{
			res.send(rows);
			//console.log(rows.insertId)
			userid = parseInt(rows.insertId);

			console.log("userid generated is "+userid)	
			var details = { user_id: userid,  fname:fname,lname: lname, email: email,created_by: userid, birth_date: bdate,
					creation_date: new Date(), last_updated_by: userid , last_updated_date: new Date()
					};

			connection.query('insert into user_details set ?',details,function(err1,rows1,fields)
			{
				if(!err1){
					res.send(rows1);
				}else{
					console.log(err1);
					res.send(err1);
					console.log(err1.code);	
				}					

			});

		}else{
			console.log(err);
			res.send(err);
			console.log(err.code);	
		}
	});
		
	
});

router.get('/themes', function(req, res) {
	connection.query('Select * from themes_all ', function(err,rows,fields){
		if(!err){
			console.log(rows);
			res.send(rows);
		}else{
			console.log('Error while performing query for get themes');
		}
	});    
})

router.get('/themes/:themeid', function(req, res) {
	var themeid = parseInt(req.params.themeid);
	connection.query('Select * from subthemes_all where theme_id = '+themeid, function(err,rows,fields){
		if(!err){
			//console.log('The solution is: ',rows);
			res.send(rows);
		}else{
			console.log(err);
		}
	});    
})

/*router.post('/test', function(req, res) {
	//var themeid = parseInt(req.params.themeid);
	var username = req.body.uname;
	console.log('inside test');
	connection.query('Select * from user_master' , function(err,rows,fields){
		if(!err){
			//console.log('The solution is: ',rows);
			var response = { result: 'success' };
			console.log(response);
			res.send(response);
			//res.redirect('/themes');
		}else{
			console.log(err);
		}
	});
	
	console.log(username);    
})*/


router.get('/word/:wid', function(req, res) {
	var wordId = parseInt(req.params.wid);
	connection.query('select a.word,a.word_id,b.description theme,c.description subtheme,d.description type '+ 
					 'from words_all a, themes_all b, subthemes_all c, types_all d '+ 
					 'where a.theme_id = b.theme_id and a.subtheme_id = c.subtheme_id and a.type_id = d.type_id and a.word_id = '+wordId
					 , function(err,rows,fields){
		if(!err){
			//console.log('The solution is: ',rows);
			res.send(rows);
		}else{
			console.log('Error while performing query /word/wid for word id'+wid);
		}
	});    
})

router.get('/word/:themeid/:subthemeid', function(req, res) {
	var themeid = parseInt(req.params.themeid);
	var subthemeid = parseInt(req.params.subthemeid);
	connection.query('select a.word,a.word_id,b.description theme,c.description subtheme,d.description type '+ 
					 'from words_all a, themes_all b, subthemes_all c, types_all d '+ 
					 'where a.theme_id = b.theme_id and a.subtheme_id = c.subtheme_id and a.type_id = d.type_id and a.theme_id = '+themeid+
					 ' and a.subtheme_id = '+subthemeid
					 , function(err,rows,fields){
		if(!err){
			//console.log('The solution is: ',rows);
			res.send(rows);
		}else{
			console.log('Error while fetching words for themeid: '+themeid+" and subthemeid: "+subthemeid);
			console.log(err);
		}
	});    
})	

/* Encryption and Decryption*/
var crypto = require('crypto');
algorithm = 'aes-256-ctr',
 password = 'd6F3Efeq';

function encrypt(text){
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}
 
function decrypt(text){
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}
 

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/', router);


// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
