import app from './app.js';
import config from './config/index.js';

app.listen(config.port, () => {
  console.log(`Time Traveling Toaster backend listening on port ${config.port} [${config.env}]`);
});
