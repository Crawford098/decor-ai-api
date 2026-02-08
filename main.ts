import app from './src/app.js';
import { config } from './src/config/env.js';

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`Decor AI API is running at http://localhost:${PORT}`);
  console.log(`Environment: ${config.nodeEnv}`);
});