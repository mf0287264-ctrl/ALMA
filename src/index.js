import { createApp } from './app.js';
import { database_connect } from './DB/db.connection.js';

const app = createApp();
await database_connect();
const server = app.listen(Number(process.env.PORT || 5000), process.env.HOST || '127.0.0.1', () => console.log('ALMA API started.'));
server.requestTimeout = 30000;
server.headersTimeout = 15000;
server.maxRequestsPerSocket = 100;
export default app;
