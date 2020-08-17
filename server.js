const fs = require('fs');
const templates = require('./templates');
const crypto = require('crypto');

// We're using the Better-SQLite3 NPM module as a database.
// Documentation: https://github.com/JoshuaWise/better-sqlite3/wiki/API
const Database = require('better-sqlite3');

// If you want to reset to a clean database, uncomment this line for a second or two:
//fs.unlinkSync('.data/sqlite3.db');
const db = new Database('.data/sqlite3.db');

// Make sure tables and initial data exist in the database
db.exec(fs.readFileSync('schema.sql').toString());

// Create an express ap
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();

// Configure express to trust the Glitch proxies.
app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal'])

// Automatically decode URL-encoded bodies
app.use(bodyParser.urlencoded({extended: true}));

// Automatically parse cookies
app.use(cookieParser());

// Debug log
let logFile = fs.openSync('.data/access.log','w');
app.use(function(req,rsp,next) {
  fs.write(logFile, `${req.method} ${req.path} ${JSON.stringify(req.body)}\n`, function(){});
  next();
});

// Set userId on request if user is logged in. Value is 0 otherwise.
app.use(function(req,rsp,next) {
  req.userId = 0 | req.cookies.login;
  next();
});


// The main page
app.get("/", function(req,rsp) {
  rsp.end(templates.mainPage({
    quotes: db.prepare('select id, text, attribution from quotes order by id').all(),
    userId: req.userId,
    error: req.query.error
  }));
});

// The quote comments page
app.get("/:quoteId([0-9]+)", function(req,rsp) {
  rsp.end(templates.commentsPage({
    quote: db.prepare(`select id, text, attribution from quotes where id=${req.params.quoteId}`).get(),
    comments: db.prepare(`select text,time,name as userName from comments c left join users u on u.id=c.userId where quoteId=${req.params.quoteId} order by c.id`).all(),
    userId: req.userId
  }));
});

// Adding a quote
app.post("/quotes", function(req,rsp) {
  db.exec(`insert into quotes(text,attribution,userId) values("${req.body.text}","${req.body.attribution}",${req.userId})`);
  rsp.redirect('/#bottom');
});

// Adding a comment
app.post("/:quoteId([0-9]+)/comments", function(req,rsp) {
  const unixTime = 0 | (new Date()/1000);
  db.exec(`insert into comments(text,quoteId,userId,time) values("${req.body.text}",${req.params.quoteId},${req.userId},${unixTime})`);  
  rsp.redirect(`/${req.params.quoteId}#bottom`);
});


function sha1(input) {
  return crypto.createHash('sha1').update(input).digest('hex');
}


// Sign-in / sign-up
app.post("/signin", function(req,rsp) {
  let userId;
  let username = req.body.username.toLowerCase().trim();
  let passwordHash = sha1(req.body.password);
  
  if (username==='') {
    return rsp.redirect('/?error='+encodeURIComponent("Username cannot be empty"));
  }
  if (req.body.password.length<6) {
    return rsp.redirect('/?error='+encodeURIComponent("Password is too short"));
  }

  let row = db.prepare(`select id,passwordHash from users where name="${username}"`).get();
  if (row) { // user exists
    if (passwordHash !== row.passwordHash) {
      // wrong! redirect to the main page with an error message
      return rsp.redirect('/?error='+encodeURIComponent("Invalid password!"));
    }
    userId = row.id;
  }
  else { // new sign up
    let info = db.prepare(`insert into users(name,passwordHash) values("${username}", "${passwordHash}")`).run();
    userId = info.lastInsertRowid;
  }
  // correct or new sign up! set login cookie and redirect to main page
  rsp.cookie('login', userId, { maxAge: 30*24*60*60*1000 }); // expire after 30 days
  rsp.redirect('/');
});


// Sign-out
app.get("/signout", function(req,rsp) {
  rsp.clearCookie('login');
  rsp.redirect('/');
});


// Static data (for CSS)
app.use(express.static('.'));


// Start accepting requests
const listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
