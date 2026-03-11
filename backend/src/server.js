const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const weatherRoutes = require('./routes/weatherRoutes');
const { checkJwt } = require('./middleware/auth');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', checkJwt, weatherRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Weather Analytics API running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

