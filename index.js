const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.f3zbe.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db('test-travel');
    const commentCollectionInhome = database.collection('comments');
    //for comment section in home page
    const topservicesCollectionInHome = database.collection('topservices');
    //for services at home page
    const allservicesCollection = database.collection('allservices');
    //for service purchse collection
    const allbuyingservicesCollection =
      database.collection('allbuyingservices');

    //--------for all buying/purchase list------------
    //for user collection
    const userCollection = database.collection('users');
    //email
    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === 'admin') {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    //user post
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      console.log('result', result);
      res.json(result);
    });
    //upsert
    //upsert uset for to make sure one user info 1 tyme register
    app.put('/users', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });
    app.put('/users/admin', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: 'admin' } };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.json(result);
    });
    //for admin to see all orders who and who have ordered
    app.get('/admin/allbuyingservices', async (req, res) => {
      const cursor = allbuyingservicesCollection.find({});
      // console.log(query);
      const listsItems = await cursor.toArray();
      // console.log(listsItems);
      res.json(listsItems);
    });
    //to show services list  which are bought my client
    app.get('/allbuyingservices', async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const cursor = allbuyingservicesCollection.find(query);
      // console.log(query);
      const listsItems = await cursor.toArray();
      // console.log(listsItems);
      res.json(listsItems);
    });
    //service which was bought putted in server
    app.post('/allbuyingservices', async (req, res) => {
      const boughtservices = req.body;
      const result = await allbuyingservicesCollection.insertOne(
        boughtservices
      );
      // console.log(boughtservices);
      // console.log(result);
      res.json(result);
    });

    //delet for client if he want to cancel order
    app.delete('/allbuyingservices/:_id', async (req, res) => {
      const id = req.params._id;
      const query = { _id: ObjectId(id) };
      const result = await allbuyingservicesCollection.deleteOne(query);
      res.json(result);
      // allbuyingservicesCollection
      //   .deleteOne({ _id: ObjectId(req.params._id) })
      //   .then((result) => {
      //     res.send(result.deletedCount > 0);
      //   });
    });

    //-------------------for allservices  page where more than 6 exists--------------
    //for allservice to show in allservices page from db
    app.get('/allservices', async (req, res) => {
      const cursor = allservicesCollection.find({});
      const allservices = await cursor.toArray();
      res.send(allservices);
    });

    //for getting single service in booking page from home top services
    //get single service
    app.get('/allservices/:id', async (req, res) => {
      const id = req.params.id;
      // console.log('getting specific id for boking', id);
      const query = { _id: ObjectId(id) };
      const serviceinallservicepage = await allservicesCollection.findOne(
        query
      );
      res.json(serviceinallservicepage);
    });
    //for all-services taking from form uploading to db in service page
    app.post('/allservices', async (req, res) => {
      const allservice = req.body;
      console.log('hitting the post api for all services', allservice);

      const result = await allservicesCollection.insertOne(allservice);
      // console.log(result);
      res.json(result);
    });

    //deleting from home page services
    app.delete('/allservices/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await allservicesCollection.deleteOne(query);
      res.json(result);
    });

    //--------------above code for all services shown in allservices  page--------------

    //-------------------for home page top services--------------
    //for topservice to show in home from db
    app.get('/topservices', async (req, res) => {
      const cursor = topservicesCollectionInHome.find({});
      const topservices = await cursor.toArray();
      res.send(topservices);
    });

    //for getting single service in booking page from home top services
    //get single service
    app.get('/topservices/:id', async (req, res) => {
      const id = req.params.id;
      console.log('getting specific id for boking', id);
      const query = { _id: ObjectId(id) };
      const serviceinhome = await topservicesCollectionInHome.findOne(query);
      res.json(serviceinhome);
    });

    //for top-services taking from form uploading to db in home
    app.post('/topservices', async (req, res) => {
      const topservice = req.body;
      console.log('hitting the post api for top services', topservice);

      const result = await topservicesCollectionInHome.insertOne(topservice);
      // console.log(result);
      res.json(result);
    });
    //deleting from home page services
    app.delete('/topservices/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await topservicesCollectionInHome.deleteOne(query);
      res.json(result);
    });
    //--------------above code for top service shown in home page

    // -------------------forComment-section----------------
    //get api for comment
    app.get('/comment', async (req, res) => {
      const addingcomment = commentCollectionInhome.find({});
      const comments = await addingcomment.toArray();
      res.send(comments);
    });
    //getting comment by id to  update cmnt
    app.get('/comment/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const comnt = await commentCollectionInhome.findOne(query);

      // console.log('load withid: ', id);
      res.send(comnt);
    });
    //post apifor comment

    app.post('/comment', async (req, res) => {
      const newcomment = req.body;
      const result = await commentCollectionInhome.insertOne(newcomment);
      // console.log('new comment post', req.body);
      // console.log('added newcomment', result);
      res.json(result);
    });
    // commentadding to db above code
    //updating comment
    app.put('/comment/:id', async (req, res) => {
      const id = req.params.id;
      const updatedComment = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name: updatedComment.name,
          comment: updatedComment.comment,
          raiting: updatedComment.raiting,
        },
      };
      const result = await commentCollectionInhome.updateOne(
        filter,
        updateDoc,
        options
      );
      console.log('updating comment', req);
      res.json(result);
    });

    //comment deleting
    app.delete('/comment/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await commentCollectionInhome.deleteOne(query);

      // console.log('deleting comment with id', id, result);
      res.json(result);
    });
    // console.log('database connected successfully');
    // ----------------------for comment section ended---------------
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello trave-with me!');
});

app.listen(port, () => {
  console.log(`listening at ${port}`);
});
