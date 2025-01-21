const config = require('../../../config');
const axios = require('axios');
const CRITEO_URL = config.CRITEO_URL;
const MAIN_SELLER = config.MAIN_SELLER;
const STORE_URL = config.STORE_URL;
const {
  getInventoryPrice,
  getSKUContext,
} = require('../../XMLFeed/utils/getSKUInfo');
const { htmlDecode } = require('../../XMLFeed/utils/htmlDecode');

module.exports.getCriteoPage = async (req, res) => {
  try {
    let query = req.query;
    let headers = {
      headers: {
        Authorization: req.headers.authorization,
      },
    };

    // llamada a Criteo
    let queryString = Object.keys(query)
      .map((k) => {
        if (k !== 'seller') return `${k}=${query[k]}`;
        return '';
      })
      .join('&');
    let criQueryURL = `${CRITEO_URL}?${encodeURI(queryString)}`;
    let criResponse = await axios.get(criQueryURL, headers);
    criResponse = JSON.parse(JSON.stringify(criResponse.data));

    // obtener ids de productos
    let productIds = [];
    if (criResponse.status === 'OK' && criResponse.placements) {
      for (const placement of criResponse.placements) {
        let placementKeys = Object.keys(placement);
        for (const placementKey of placementKeys) {
          let placementContents = placement[placementKey];
          for (const content of placementContents) {
            let products = content.products;
            for (const product of products) {
              product.ProductName = htmlDecode(product.ProductName);
              if (!productIds.includes(product.ProductId))
                productIds.push(product.ProductId);
            }
          }
        }
      }

      // obtener precios del seller
      let seller = req.query.seller || MAIN_SELLER;
      let pricePetitions = productIds.map((productId) =>
        getInventoryPrice(productId, seller)
      );
      let pricesResults = await Promise.all(pricePetitions);
      let prices = pricesResults.map((result) => result.data.items[0]);

      // obtener links
      let linkPetitions = productIds.map((productId) =>
        getSKUContext(productId)
      );
      let linkResults = await Promise.all(linkPetitions);
      let links = linkResults.map((result) => result.data);

      // poner info en productos
      for (const placement of criResponse.placements) {
        let placementKeys = Object.keys(placement);
        for (const placementKey of placementKeys) {
          let placementContents = placement[placementKey];
          for (const content of placementContents) {
            let products = content.products;
            let productsToDeleteIds = [];
            for (const product of products) {
              let productPrice = prices.find(
                (price) => price?.id === product.ProductId
              );

              if (
                productPrice &&
                productPrice.sellingPrice &&
                productPrice.availability === 'available'
              ) {
                product.Price = productPrice.sellingPrice.toString();
                product.ComparePrice = productPrice.listPrice.toString();

                let link = links.find(
                  (l) => l.Id.toString() === product.ProductId.toString()
                );
                product.Link = `${STORE_URL}/${link.DetailUrl}`;
              } else productsToDeleteIds.push(product.ProductId);
            }
            content.products = products.filter(
              (p) => !productsToDeleteIds.includes(p.ProductId)
            );
          }
        }
      }
    }

    res.status(200).json(criResponse);
  } catch (error) {
    console.log('##ERROR', error);
    res.status(500).json({ message: error.message });
  }
};
