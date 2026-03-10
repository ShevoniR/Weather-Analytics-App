const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const weatherRoutes = require('./routes/weatherRoutes');
const { checkJwt } = require('./middleware/auth');

dotenv.config();

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

