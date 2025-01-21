const criteo = require('../src/criteo/routes');

module.exports = (app) => {
  app.use('/API/criteo', criteo);
  app.use('*', (req, res) => {
    res.send('Not found!!!');
  });
};
