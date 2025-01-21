const axios = require('axios');
const config = require('../../../config');
const APP_KEY = config.APP_KEY;
const APP_TOKEN = config.APP_TOKEN;
const API_BASE_URL = config.API_BASE_URL;
const SALES_CHANNEL = config.SALES_CHANNEL;

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

module.exports.getSKUS = async (page, pageSize) => {
  try {
    let skuIds = await axios.get(
      `${API_BASE_URL}/catalog_system/pvt/sku/stockkeepingunitids?page=${page}&pageSize=${pageSize}`,
      axiosConfig
    );

    return skuIds;
  } catch (error) {
    console.log(
      '##ERROR getSKUS',
      `PAGE:${page} PAGESIZE:${pageSize}`,
      error.stack
    );
    return error.message;
  }
};

module.exports.getSKUContext = async (skuId) => {
  try {
    let skuContext = await axios.get(
      `${API_BASE_URL}/catalog_system/pvt/sku/stockkeepingunitbyid/${skuId}`,
      axiosConfig
    );

    return skuContext;
  } catch (error) {
    console.log('##ERROR getSKUContext', `SKUID:${skuId}`, error.stack);
    return { data: { error: true, message: skuId } };
  }
};

module.exports.getInventoryPrice = async (skuId, seller) => {
  try {
    let items = {
      items: [
        {
          id: skuId,
          quantity: 1,
          seller: seller,
        },
      ],
    };
    let inventoryPrice = await axios.post(
      `${API_BASE_URL}/checkout/pub/orderForms/simulation/${
        SALES_CHANNEL ? '?sc=' + SALES_CHANNEL : ''
      }`,
      items,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );
    return inventoryPrice;
  } catch (error) {
    console.log('##ERROR getInventoryPrice', `SKUID:${skuId}`, error.stack);
    return error.message;
  }
};
