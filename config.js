require('dotenv').config();

const config = {
  STORE: process.env.STORE,
  STORE_URL: process.env.STORE_URL,
  MAIN_SELLER: process.env.MAIN_SELLER,
  SALES_CHANNEL: process.env.SALES_CHANNEL,
  PORT: process.env.PORT || 5000,
  API_KEY_JWT: process.env.API_KEY_JWT,
  TOKEN_EXPIRES_IN: process.env.TOKEN_EXPIRES_IN,

  // CRITEO
  CRITEO_URL: process.env.CRITEO_URL,
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,

  // CRON
  CRON_EXECUTION: '0 0 19 * * *',

  // API
  APP_KEY: process.env.APP_KEY,
  APP_TOKEN: process.env.APP_TOKEN,
  API_BASE_URL: process.env.API_BASE_URL,

  // SFTP
  SFTP_HOST: process.env.SFTP_HOST,
  SFTP_USER: process.env.SFTP_USER,
  SFTP_PASS: process.env.SFTP_PASS,
  SFTP_PORT: process.env.SFTP_PORT,
};

module.exports = config;
