const express = require('express');
const router = express.Router();
const documentController = require('../controllers/document.controller');
const shareController = require('../controllers/share.controller');
const authenticate = require('../middleware/auth.middleware');
const handleUpload = require('../middleware/upload.middleware');
const validate = require('../middleware/validate.middleware');
const { createDocumentSchema, updateDocumentSchema, shareDocumentSchema } = require('../validation/schemas');

router.use(authenticate);

// Shared Documents
router.get('/shared-with-me', shareController.listSharedWithMe);

// Import
router.post('/import', handleUpload, documentController.importDocument);

// Document CRUD
router.post('/', validate(createDocumentSchema), documentController.create);
router.get('/', documentController.list);
router.get('/:id', documentController.get);
router.patch('/:id', validate(updateDocumentSchema), documentController.update);
router.delete('/:id', documentController.remove);

// Sharing
router.post('/:id/share', validate(shareDocumentSchema), shareController.shareDocument);
router.delete('/:id/share/:userId', shareController.revokeShare);
router.get('/:id/shares', shareController.listShares);

module.exports = router;
