const config = require('../../../config');
const fs = require('fs');
const STORE_URL = config.STORE_URL;
const {
  getSKUS,
  getSKUContext,
  getInventoryPrice,
} = require('../utils/getSKUInfo');
const { currencyConverter } = require('../utils/currencyConverter');
const { escapeCharacters } = require('../utils/escapeCharacters');
const { getCategories } = require('../utils/getCategories');
const MAIN_SELLER = config.MAIN_SELLER;
const STORE = config.STORE;

module.exports.createXMLFile = async () => {
  console.log('##CREATINGXML');
  try {
    let missingSKUIds = [];

    // abre XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
      <rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
        <channel>
          <title>${STORE}</title>
          <link>${STORE_URL}</link>
          <description>${STORE}</description>`;

    // traer SKUs
    let page = 1;
    let pageSize = 100;
    let next = true;

    do {
      console.log('##STARTING PAGE', page);
      let skuIds = await getSKUS(page, pageSize);
      if (skuIds.data.length > 0) {
        let skuPetitions = skuIds.data.map((skuId) => getSKUContext(skuId));
        let skus = await Promise.all(skuPetitions);
        for (let sku of skus) {
          sku = sku.data;
          if (sku?.error) {
            missingSKUIds.push(sku.message);
            console.log('##MISSINGSKUS', missingSKUIds);
          }
          if (sku?.IsActive) {
            let XMLString = await makeXMLString(sku);
            xml += XMLString;
          }
        }

        page++;
        // next = false;
      } else {
        console.log('##NO MORE PAGES');
        next = false;
      }
    } while (next);

    console.log('##MISSINGSKUS', missingSKUIds);
    if (missingSKUIds.length) {
      console.log('##GETTIGN MISSING SKUS');
      let missingSKUPetitions = missingSKUIds.map((skuId) =>
        getSKUContext(skuId)
      );
      let missingSKUs = await Promise.all(missingSKUPetitions);
      for (let sku of missingSKUs) {
        sku = sku.data;
        if (sku?.IsActive) {
          let XMLString = await makeXMLString(sku);
          xml += XMLString;
        }
      }
    }

    // cierra XML
    xml += `</channel>
    </rss>`;
    xml = xml.replace(/ {4}|[\t\n\r]/gm, '');

    // guardar archivo
    let fileName = `${STORE}_feed.xml`;
    fs.writeFileSync(`./public/files/${fileName}`, xml, (err) => {
      if (err) throw err;
    });
  } catch (error) {
    console.log('##ERROR', error.stack);
    console.log('##ERROR', error.message);
  }
};

const makeXMLString = async (sku) => {
  let XMLstring = '';
  try {
    let skuCategories = getCategories(sku);
    let inventoryPrice = await getInventoryPrice(sku.Id, MAIN_SELLER);

    // agregar a XML
    if (inventoryPrice?.data?.items[0]) {
      XMLstring += `
        <item>
            <g:id>${sku.Id}</g:id>
            <g:title>${escapeCharacters(sku.NameComplete)}</g:title>
            <g:description>${escapeCharacters(
              sku.ProductDescription ? sku.ProductDescription : ''
            )}</g:description>
            <g:google_product_category>${escapeCharacters(
              skuCategories.values
            )}</g:google_product_category>
            <g:link>${STORE_URL}/${sku.DetailUrl}</g:link>
            <g:product_type>${escapeCharacters(
              skuCategories.values
            )}</g:product_type>
            <g:product_type_key>${skuCategories.ids}</g:product_type_key>
            <g:image_link>${sku.ImageUrl}</g:image_link>
            ${
              sku.Images.length
                ? sku.Images.map((im) => {
                    return `<g:additional_image_link>${im.ImageUrl}</g:additional_image_link>`;
                  }).join('')
                : ''
            }
            <g:availability>${
              inventoryPrice.data.items[0].availability === 'available'
                ? 'in stock'
                : 'out of stock'
            }</g:availability>
            <g:price>${currencyConverter.format(
              Number(inventoryPrice.data.items[0].listPrice) / 100
            )}</g:price>
            <g:sale_price>${currencyConverter.format(
              Number(inventoryPrice.data.items[0].sellingPrice) / 100
            )}</g:sale_price>
            <g:brand>${escapeCharacters(sku.BrandName)}</g:brand>
            <g:gtin>${sku.AlternateIds.Ean}</g:gtin>
            <g:item_group_id>${sku.ProductId}</g:item_group_id>
        </item>
        `;
    }
  } catch (error) {
    console.log('##ERROR addSKUToXML', error.stack);
    console.log('##ERROR addSKUToXML', error);
  }
  return XMLstring;
};
