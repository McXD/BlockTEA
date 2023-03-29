'use strict'

module.exports = function (app, opts) {
  app.use('/api/contracts', require('./handlers/contract'))
  app.use('/api/ledger', require('./handlers/ledger'))
  app.use('/api/config/contracts', require('./handlers/eventConfiguration'))
}
