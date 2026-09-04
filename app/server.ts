import app from './app.js';
import dotenv from 'dotenv';

import { getRandomImportantTask } from './src/services/quest-controller.service.js';

dotenv.config();

const PORT = process.env.PORT || '3000';

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    getRandomImportantTask();
});

