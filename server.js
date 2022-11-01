const  express = require('express');
const request = require('request');
const app= express();
const port= 4040;

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore  } = require("firebase-admin/firestore");
var  serviceAccount = require("./key.json");

initializeApp({
   credential : cert(serviceAccount),
});

const db = getFirestore();
 app.use(express.static('public'))
 
app.set('view engine','ejs');
app.get("/" , (req,res)=>{
   res.render("start");
})
app.get("/signin" , (req,res)=>{
    res.render('signin')
 })

 app.get("/signinsubmit" , (req,res) =>{
     const mail = req.query.email;
     const pword = req.query.password;
     
     // getting data from  collection and  validating
     db.collection("users")
     .where("email", "==", mail)
     .where("password" , "==" , pword)
     .get()
     .then((docs) =>{
        if (docs.size>0){
           res.render("wordsearch");
        }
        else{
           res.send("<body><h1>Login Failed</h1></body>");
        }
     })

     
 });
 app.get("/signupsubmit" , (req,res) => {
    const fname = req.query.fname;
    const lname = req.query.lname;
    const password = req.query.password;
    const cpassword = req.query.cpassword;
    const email = req.query.email;
    
    // adding data to collection
    if (  password != cpassword){
           res.send("Enter correct password");
    }
    else{
     db.collection("users")
       .add({
         name: fname+ " " +lname,
         email: email,
         password :password,
      })
      
      .then( () => {
        res.send("<body> <h1> Sign up successful</h1> </body>");
      });
    }
 });

 app.get("/signup" , (req,res)=>{
    res.render('signup')
 })

 app.get("/wordfound",(req,res) =>{
   const word = req.query.word;
   request('https://api.dictionaryapi.dev/api/v2/entries/en/'+word , function (error, response, body) {
     

     console.log(JSON.parse(body));
      
      if(JSON.parse(body)){
         var datainfo=[];
         const data = JSON.parse(body);
          const searchword = data[0].word;
          const pho = data[0].phonetic;
          const meaning = data[0].meanings[0].definitions[0].definition;
          const ex  = data[0].meanings[0].definitions[0].example;
          const pos = data[0].meanings[0].partOfSpeech; 
          datainfo.push(searchword);
          datainfo.push(pho);
          datainfo.push(meaning);
          datainfo.push(ex);
          datainfo.push(pos);
         
          
         res.render("wordfound",{sample:datainfo});
      }
      else
         // console.log("not found")
          res.send("not found");
      });
 });
 
app.listen( port , () =>{
    console.log(`Server is running on ${port}`);
})