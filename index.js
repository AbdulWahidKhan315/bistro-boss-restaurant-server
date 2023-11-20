const express = require('express');
require('dotenv').config()
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oiitlmi.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const userCollection = client.db('bistroBossDB').collection('users');
        const menuCollection = client.db('bistroBossDB').collection('menu');
        const reviewsCollection = client.db('bistroBossDB').collection('reviews');
        const cartsCollection = client.db('bistroBossDB').collection('carts');

        //user related api
        app.post('/users',async(req,res)=>{
            const user = req.body;
            //inset email if usr doesn't exist...
            const query = {email: user?.email};
            const existingUser = await userCollection.findOne(query);
            if(existingUser){
                return res.send({message: 'User already exist', insertedId: null})
            }
            const result = await userCollection.insertOne(user);
            res.send(result);
        })

        app.get('/menu',async(req,res)=>{
            const result = await menuCollection.find().toArray();
            res.send(result);
        })

        app.get('/reviews',async(req,res)=>{
            const result = await reviewsCollection.find().toArray();
            res.send(result)
        })

        //carts collection

        app.get('/carts',async(req,res)=>{
            const email = req.query.email;
            const query = {email: email};
            const result = await cartsCollection.find(query).toArray();
            res.send(result);
        })

        app.post('/carts',async(req,res)=>{
            const cartItem = req.body;
            const result = await cartsCollection.insertOne(cartItem);
            res.send(result);
        })

        app.delete('/carts/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result = await cartsCollection.deleteOne(query);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Boss is sitting')
})

app.listen(port, () => {
    console.log(`Bistro boss is running on PORT: ${port}`)
})