const express = require('express');
const router = express.Router();
const {
  getTags,
  createTag,
  deleteTag,
} = require('../controllers/tagController');

router.get('/', getTags);
router.post('/', createTag);
router.delete('/:id', deleteTag);

module.exports = router;
