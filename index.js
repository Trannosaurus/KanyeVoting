const express = require('express')
const app = express()

const bodyParser = require ('body-parser')
const {MongoClient} = require('mongodb')
require('dotenv').config()
const path = require('path')
app.use(express.static(path.join(__dirname, "public")));
app.set('views', path.join(__dirname, 'views'));


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const uri = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cmsc335.1tnl8cj.mongodb.net/?retryWrites=true&w=majority`
const client = new MongoClient(uri)

const port = process.env.PORT || 3000
app.listen(port, async () => {
    console.log(`Server started running at http://localhost:3000`)
    // await client.connect()
    // console.log('Connected to MongoDB')
})

app.get('/', async (req,res) => {
    try{
        let data = await fetch("https://api.kanye.rest")
            .then(rsp => rsp.json())
            .catch(err => console.error(err))
        let quote1 = data.quote
        data = await fetch("https://api.kanye.rest")
            .then(rsp => rsp.json())
            .catch(err => console.error(err))
        let quote2 = data.quote
        res.render("index", {quote1, quote2})
    }catch {
    }
})

app.post('/', async (req,res) => {
    const quote = req.body.quote
    const db = client.db(process.env.MONGO_DB_NAME)
    const collection = db.collection(process.env.MONGO_COLLECTION)
    console.log("In POST>>> " + quote);
    /*
    await collection.findOneAndUpdate({key: quote}, (found) => {
        { $set: {count: found? found.count: 1}}
    });
    */
    let updated = await collection.findOneAndUpdate({quote: quote},{$inc: {count: 1}}, {upsert: true, returnOriginal: false})
    res.redirect("/")
})

app.get('/leaderboard', async (req,res) => {
    const db = client.db(process.env.MONGO_DB_NAME)
    const collection = db.collection(process.env.MONGO_COLLECTION)
    let quotes = await collection.find({quote: {$exists: true}}).toArray()
    console.log("QUOTES>>> " + quotes)
    res.render("leaderboard", {quotes})
})
