module.exports.getCategories = (sku) => {
  let ids = sku.ProductCategoryIds.split('/').filter((c) => c !== '');
  return {
    ids: ids.join(' > '),
    values: ids.map((c) => sku.ProductCategories[c]).join(' > '),
  };
};
