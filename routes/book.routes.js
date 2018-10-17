const express = require('express')
const router = express.Router()

const book_controller = require('../controllers/book.controller')

router.get('/', book_controller.return_all_books)
router.post('/', book_controller.book_create_new_record)
router.get('/:id', book_controller.book_details)
router.put('/:id', book_controller.book_update)
router.delete('/:id', book_controller.book_delete)
router.get('/title/:title', book_controller.find_by_title)
router.get('/author/:author', book_controller.find_by_author)
router.get('/tags/:tags', book_controller.find_by_tags)
router.get('/isbn/:isbn', book_controller.find_by_isbn)

module.exports = router