import express from 'express';
import cors from 'cors';
import gameRoutes from './routes/gameRoutes.js';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use('/api/game',gameRoutes);

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
