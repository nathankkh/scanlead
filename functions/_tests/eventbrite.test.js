const functions = require('../index.js');

test('getEBKey returns HH key', () => {
  expect(functions.getEBKey()).toBe('GUURBYS75ETONECNPEGI');
});
