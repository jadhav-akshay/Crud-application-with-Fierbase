//import libraries
const functions = require ("firebase-functions");
const admin = require ("firebase-admin");
const express = require ("express");
const path = require ("path");

const serviceAccount = require("/home/sankeyl131/Downloads/service-account-file.json");

//initialize connection with firebase
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://test-3da91.firebaseio.com"
   });

//initialize express server
const app = express();

//initialize the database and the collection 
const db = admin.firestore();
const userCollection = 'users';

//default route
app.get('/', (req, res) => {
    // res.send('Home screen')
    res.sendFile(path.join(__dirname+ '/views/index.html'));
});

//default about
// app.get('/about', (req, res) => {
//     // res.send('Home screen')
//     res.render("about", {title:"About page", message:"About html view"})
// });

// read users data
app.get('/getUserList', async (req, res) => {
    try {
        const userQuerySnapshot = await db.collection(userCollection).get();
        const users = [];
        userQuerySnapshot.forEach(
            (doc)=>{
                users.push({
                    id: doc.id,
                    data:doc.data()
            });
            }
        );
        res.status(200).send(users);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Create new user
app.post('/insertUser', async (req, res) => {
    try {        
        const record = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            contactNumber: req.body.contactNumber
        };
        functions.logger.info(`inserting data---------->`);
        console.log("%j",req.body);
        const newDoc = await db.collection(userCollection).add(record);        
        res.status(201).send(`Created a new user: ${newDoc.id}`);
    } catch (error) {
        res.status(400).send(`error` + error)
    }
});

//delete existing user
app.delete('/deleteUser/:id', (req, res) => {
    (async () => {
    try {
        const document = db.collection(userCollection).doc(req.params.id);
        functions.logger.info(`record data-->found`);
        await document.delete();
        return res.status(200).send(`Delected ${req.param.id}`);
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
    })();
});

//update existing user
app.post('/updateUser', (req, res) => {
    (async () => {
    try {
        const document = db.collection(userCollection).doc(req.body.id);
        const newDoc= await document.update({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            contactNumber: req.body.contactNumber
        });
        console.log(`Updated user----->%j`,newDoc);
        return res.status(200).send(`Updated user----->`);
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
    })();
});

//desgin views
// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "pug");
// app.use(express.static(path.join(__dirname, "public"));

//define google cloud function name
exports.app = functions.https.onRequest(app);



// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

// exports.app = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// await db.collection(userCollection).doc('/' + req.body.id + '/')
    //       .create({firstName: User.firstName});