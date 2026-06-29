const express = require('express');
const router = express.Router();
const { globalSearch, getSearchSuggestions } = require('../controllers/searchController');

router.get('/', globalSearch);
router.get('/suggestions', getSearchSuggestions);

module.exports = router;
