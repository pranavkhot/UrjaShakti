const { getDataConnect, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'default',
  service: 'urjashakti-solar-calculator',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

