require ('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(express.json());
app.use(cors());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qkg2o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // await client.connect();

    const serviceCollections = client.db('servicesDB').collection('services');
    const reviewCollection = client.db('servicesDB').collection('reviews');

    // services API
    app.get('/featuredServices', async (req,res)=>{
        const result = await serviceCollections.find().limit(6).toArray();
        res.send(result)
    })
    app.post('/services', async (req,res)=>{
      const data = req.body;
      const result = await serviceCollections.insertOne(data);
      res.send(result);
    });
    app.get('/services', async (req,res)=>{
      const email = req.query.email;
      let query = {};
      if(email){
        query = {userEmail: email}
      }
      const result = await serviceCollections.find(query).toArray();
      res.send(result)
    })
    app.get('/services/:id', async (req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await serviceCollections.findOne(query);
      res.send(result)
    });
    app.put('/services/:id', async (req,res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const options = { upsert: false };
      const updateDoc = {
        $set: req.body
      }
      const result = await serviceCollections.updateOne(filter,updateDoc,options)
      res.send(result)
    })

    // reviews API
    app.post('/reviews', async (req,res)=>{
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result)
    })
    app.get('/reviews', async (req,res)=>{
      const result = await reviewCollection.find().toArray();
      res.send(result)
    })
    app.get('/reviews/service/:service_id', async (req,res)=>{
      const serviceId = req.params.service_id;
      const query = {service_id: serviceId};
      const result = await reviewCollection.find(query).toArray();
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


app.get('/', (req,res)=>{
    res.send("Server is running")
})

app.listen(port, ()=>{
    console.log(`server is running on ${port}`)
})