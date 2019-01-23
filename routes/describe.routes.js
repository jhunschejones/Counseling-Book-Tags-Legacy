const express = require('express');
const router = express.Router();

const describe_controller = require('../controllers/describe.controller');

router.get('/', describe_controller.display_api_documentation);

module.exports = router;