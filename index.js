require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// Middlewire
app.use(cors());
app.use(express.json());

// CONNECTION CODE START___
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fmczp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    // await client.connect();

    const movieCollection = client.db("movieDB").collection("movie");
    const favouriteCollection = client.db("movieDB").collection("favourites");

    app.get("/movie", async (req, res) => {
      const cursor = movieCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // To get specific Movie
    app.get("/movie/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await movieCollection.findOne(query);
      res.send(result);
    });

    // Add a new Movie
    app.post("/movie", async (req, res) => {
      const newMovie = req.body;
      const result = await movieCollection.insertOne(newMovie);
      res.send(result);
    });

    // Add movie to favourites
    app.post("/favourites", async (req, res) => {
      const { userEmail, movieId } = req.body;
      const movie = await movieCollection.findOne({
        _id: new ObjectId(movieId),
      });

      // const existingFavorite = await favouriteCollection.findOne({
      //   userEmail,
      //   _id: new ObjectId(movieId),
      // });

      // if (existingFavorite) {
      //   return res
      //     .status(400)
      //     .send({ message: "Movie is already in your favorites" });
      // }

      const favouriteMovie = { ...movie, userEmail };
      const result = await favouriteCollection.insertOne(favouriteMovie);
      res.send(result);
    });
    // Get All Favourite Movie
    app.get("/favourites", async (req, res) => {
      const cursor = favouriteCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    // For Delete Favourite movie
    app.delete("/favourites/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await favouriteCollection.deleteOne(query);
      res.send(result);
    });

    // For Update Specific Movie
    app.put("/movie/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedMovie = req.body;
      const movie = {
        $set: {
          title: updatedMovie.title,
          posterUrl: updatedMovie.posterUrl,
          genre: updatedMovie.genre,
          duration: updatedMovie.duration,
          releaseYear: updatedMovie.releaseYear,
          summary: updatedMovie.summary,
        },
      };
      const result = await movieCollection.updateOne(filter, movie, options);
      res.send(result);
    });
    // For Delete Movie
    app.delete("/movie/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await movieCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);
// CONNECTION CODE END______

app.get("/", (req, res) => {
  res.send("Server Running");
});
app.listen(port, () => {
  console.log(`Server running on port:${port}`);
});
