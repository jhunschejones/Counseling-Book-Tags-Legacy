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
router.put('/tags/:id', book_controller.add_tags)
router.delete('/tags/:id', book_controller.delete_tags)
router.put('/comments/:id', book_controller.add_comments)
router.delete('/comments/:id', book_controller.delete_comments)
router.get('/utility/blank', book_controller.find_blank_books)
router.get('/utility/missing', book_controller.find_books_missing_tags)

module.exports = router