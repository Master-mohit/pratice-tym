var express = require('express');
const userModel = require("./users");
const postModel = require("./post");
const passport = require('passport');
const localStregy = require("passport-local");
const upload = require("./multer");
var router = express.Router();


passport.use(new localStregy(userModel.authenticate()));

router.get('/', function(req, res) {
  res.render('index', {footer: false});
});

router.get('/login', function(req, res) {
  res.render('login', {footer: false});
});

router.get('/feed',isLogDinIn, async function(req, res) {
  const posts = await postModel.find();
  const user = await userModel.findOne({ username: req.session.passport.user });
  res.render('feed', {footer: true, posts, user});
});

router.get('/profile',isLogDinIn, async function(req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  const posts = await postModel.find();
  res.render('profile', {footer: true, user, posts});
});

router.get('/search',isLogDinIn, function(req, res) {
  res.render('search', {footer: true});
});

router.get('/edit',isLogDinIn, async function(req, res) {
  const user = await userModel.findOne({username: req.session.passport.user})
  res.render('edit', {footer: true, user});
});

router.get('/upload',isLogDinIn, function(req, res) {
  res.render('upload', {footer: true});
});

router.post("/register", function(req, res, next){
  const userData = new userModel({
    username: req.body.username,
    name: req.body.name,
    email: req.body.email,
    
    
  });
  userModel.register(userData, req.body.password)
  .then(function(){
    passport.authenticate("local")(req, res, function (){
      res.redirect("/profile")
    })
  })
  });
  
  router.post("/login", passport.authenticate ("local", {
    successRedirect : "/profile",
    failureRedirect : "/login"
  }), function(req, res){
  });
  
  router.post('/logout', function(req, res, next){
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });
  
  function isLogDinIn(req, res, next){
    if(req.isAuthenticated()) return next();
    res.redirect("/")
  }

  router.post("/update", upload.single("image"), async function(req, res) {
   
     const user = await userModel.findOne({ username: req.session.passport.user });
      if (user) {
        user.username = req.body.username;
        user.name = req.body.name;
        user.bio = req.body.bio;
        if (req.file) {
          user.profileImage = req.file.filename; 
        }
        await user.save();
        res.redirect("/profile")
        
      } 
    
  });

  router.post('/upload', upload.single("image"), isLogDinIn, async function(req, res) {
    const user = await userModel.findOne({username: req.session.passport.user})
    const post = await postModel.create({
       picture : req.file.filename,
       user : user._id,
       caption : req.body.caption,

  })
  user.posts.push(post._id)
   await user.save();
   res.redirect("/feed")
  });
  

  router.get('/username/:kuch',isLogDinIn, async function(req, res) {
    const regex = new RegExp(`${req.params.kuch}`, 'i');
  const user = await userModel.find({kuch , regex});
   res.json(user)
  });
module.exports = router;
