import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || '0.0.0.0';

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

