const express = require('express')
const router = express.Router()

const book_controller = require('../controllers/book.controller')

router.get('/test', book_controller.test)
router.get('/', book_controller.return_all_books)
router.post('/', book_controller.book_create_new_record)
router.get('/:id', book_controller.book_details)
router.put('/:id', book_controller.book_update)
router.delete('/:id', book_controller.book_delete)

module.exports = router