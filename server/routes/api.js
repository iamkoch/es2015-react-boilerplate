const express = require('express');
const router = express.Router();
const _items = [
    { id: 'blah', term: 'this is an existing term' }
];

router.get('/items', (req, res) => {
  res.status(200).json(_items);
});

router.post('/items', (req, res) => {
  _terms.subscriptions.push(req.body);
  res.status(200).json(_items);
});

router.delete('/items/:id', (req, res) => {
  const id = req.params.id;
  console.log('['+id+'] DELETE');
  console.log('['+id+'] ' + JSON.stringify(_items));
  const matchingById = _items.filter(x => x.id === id )[0];

  console.log('['+id+'] ' + JSON.stringify(matchingById));
  _items.splice(_items.indexOf(matchingById), 1);
  res.status(200).json(_items);
});

module.exports = router;