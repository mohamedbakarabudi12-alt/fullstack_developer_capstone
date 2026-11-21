const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const  cors = require('cors')
const app = express()
const port = 3030;

app.use(cors())
app.use(express.json());

const reviews_data = JSON.parse(fs.readFileSync("reviews.json", 'utf8'));
const dealerships_data = JSON.parse(fs.readFileSync("dealerships.json", 'utf8'));

mongoose.connect("mongodb://mongo_db:27017/",{'dbName':'dealershipsDB'});


const Reviews = require('./review');

const Dealerships = require('./dealership');

async function seedDatabase() {
  try {
    await Promise.all([
      Reviews.updateMany({ sentiment: { $exists: false } }, { $set: { sentiment: 'neutral' } }),
      Dealerships.countDocuments().then((count) => count === 0
        ? Dealerships.insertMany(dealerships_data.dealerships)
        : null),
      Reviews.countDocuments().then((count) => count === 0
        ? Reviews.insertMany(reviews_data.reviews.map((review) => ({ ...review, sentiment: 'neutral' })))
        : null),
    ]);
  } catch (error) {
    console.error('Could not seed dealership database:', error.message);
  }
}
mongoose.connection.once('open', seedDatabase);


// Express route to home
app.get('/', async (req, res) => {
    res.send("Welcome to the Mongoose API")
});

// Express route to fetch all reviews
app.get('/fetchReviews', async (req, res) => {
  try {
    const documents = await Reviews.find();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Express route to fetch reviews by a particular dealer
app.get('/fetchReviews/dealer/:id', async (req, res) => {
  try {
    const documents = await Reviews.find({dealership: req.params.id});
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Express route to fetch all dealerships
app.get('/fetchDealers', async (req, res) => {
  try {
    res.json(await Dealerships.find({}, { _id: 0, __v: 0 }).sort({ id: 1 }));
  } catch (error) {
    res.status(500).json({ error: 'Error fetching dealerships' });
  }
});

// Express route to fetch Dealers by a particular state
app.get('/fetchDealers/:state', async (req, res) => {
  try {
    const state = req.params.state;
    const query = state.toLowerCase() === 'all' ? {} : { state: new RegExp(`^${state}$`, 'i') };
    res.json(await Dealerships.find(query, { _id: 0, __v: 0 }).sort({ id: 1 }));
  } catch (error) {
    res.status(500).json({ error: 'Error fetching dealerships' });
  }
});

// Express route to fetch dealer by a particular id
app.get('/fetchDealer/:id', async (req, res) => {
  try {
    const dealer = await Dealerships.findOne({ id: Number(req.params.id) }, { _id: 0, __v: 0 });
    if (!dealer) return res.status(404).json({ error: 'Dealership not found' });
    res.json(dealer);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching dealership' });
  }
});

app.get('/fetchCars', (req, res) => {
  const cars = [...new Set(reviews_data.reviews.map(({ car_make, car_model }) => `${car_make}|${car_model}`))]
    .map((pair) => {
      const [CarMake, CarModel] = pair.split('|');
      return { CarMake, CarModel };
    })
    .sort((a, b) => `${a.CarMake} ${a.CarModel}`.localeCompare(`${b.CarMake} ${b.CarModel}`));
  res.json(cars);
});

//Express route to insert review
app.post('/insert_review', express.raw({ type: '*/*' }), async (req, res) => {
  try {
    const data = Buffer.isBuffer(req.body) ? JSON.parse(req.body.toString()) : req.body;
    if (!data || typeof data !== 'object' || !data.review || !data.dealership) {
      return res.status(400).json({ error: 'Review details are required' });
    }
    const latest = await Reviews.findOne().sort({ id: -1 });
    const review = new Reviews({ ...data, id: latest ? latest.id + 1 : 1 });
    const savedReview = await review.save();
    res.status(201).json(savedReview);
  } catch (error) {
    console.error('Error inserting review:', error.message);
    res.status(400).json({ error: 'Review could not be saved' });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
