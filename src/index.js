import * as elastic from './services/elasticSearchService.js';
import express from 'express';
import elasticSearchRouter from './routers/elasticSearch.js';
import rateRouter from './routers/rate.route.js';
import { connectDB, sequelize } from './datastores/db.js'
import { config } from 'dotenv';
config();



await connectDB();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const PORT = process.env.PORT;
app.use(elasticSearchRouter);
app.use(rateRouter);



app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
