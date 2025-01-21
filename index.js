const app = require('./app');
const config = require('./config');
const cron = require('node-cron');
const { createXMLFile } = require('./src/XMLFeed/controller');

const PORT = process.env.PORT || config.PORT;
const CRON_EXECUTION = config.CRON_EXECUTION;

const server = app.listen(PORT, () => {
  console.log('server is running on port', server.address().port);

  cron.schedule(CRON_EXECUTION, () => createXMLFile());
});
