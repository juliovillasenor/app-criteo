const axios = require('axios');
const config = require('../../../config');
const APP_KEY = config.APP_KEY;
const APP_TOKEN = config.APP_TOKEN;
const API_BASE_URL = config.API_BASE_URL;

module.exports.getSellers = async () => {
  try {
    const axiosConfig = {
      headers: {
        'REST-Range': `resources=0-1`,
        'Cache-Control': 'no-cache',
        'X-Vtex-Use-Https': true,
        'X-VTEX-API-AppKey': APP_KEY,
        'X-VTEX-API-AppToken': APP_TOKEN,
        Accept: 'application/vnd.vtex.ds.v10+json',
      },
    };

    let sellers = await axios.get(
      `${API_BASE_URL}/catalog_system/pvt/seller/list`,
      axiosConfig
    );

    return sellers.data.map((s) => s.SellerId);
  } catch (error) {
    console.log('##ERROR', error.stack);
    return error.message;
  }
};
