import app from './app.js';
import { ENV } from './config/env.js';

const port = ENV.PORT;

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});