const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

//middleware
app.use(cors());
app.use(express.json());

function verifyJwt(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorize access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.TOKEN_SECRETE, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "forbidden access" });
    }
    console.log("decoded", decoded);
    req.decoded = decoded;
    next();
  });
  console.log("inside verify auth", authHeader);
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fsagr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
console.log(uri);
async function run() {
  try {
    await client.connect();
    const serviceCollection = client
      .db("geniusCarService")
      .collection("service");
    const orderCollection = client.db("geniusCarService").collection("order");

    /*================================================
    Getting the data from database in server side
    ==================================================== */
    /* ===========================
        jwt making
      ========================== */
    app.post("/login", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.TOKEN_SECRETE, {
        expiresIn: "1d",
      });
      res.send({ token });
    });

    // ======================================

    app.get("/service", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });
    app.get("/service/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.send(service);
    });
    //Post data========
    app.post("/service", async (req, res) => {
      const newService = req.body;
      const result = await serviceCollection.insertOne(newService);
      res.send(result);
    });
    /* =================================
      deleting data from database
    =================================== */
    app.delete("/user/:id", async (req, res) => {
      const id = req.params.id;
    });

    app.get("/order", verifyJwt, async (req, res) => {
      const decodedEmail = req.decoded.email;
      console.log(decodedEmail);
      const email = req.query.email;
      if (email === decodedEmail) {
        console.log(email);
        const query = { email: email };
        const cursor = orderCollection.find(query);
        const orders = await cursor.toArray();
        res.send(orders);
      }else{
        res.status(403).send({message:'forbidden access'})
      }
    });

    // -----------order making----------
    app.post("/order", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });
  } finally {
    // client.close()
  }
}
run().catch(console.dir());

app.get("/", (req, res) => {
  res.send("hello this is now added");
});
app.listen(port, () => {
  console.log("genius car server is Now running");
});
