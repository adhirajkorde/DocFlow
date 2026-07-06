const shareService = require('../services/share.service');

const validateId = (id) => {
  if (!id || typeof id !== 'string' || id.length < 5) {
    const error = new Error('Invalid ID');
    error.statusCode = 400;
    throw error;
  }
};

const shareDocument = async (req, res, next) => {
  try {
    const { id } = req.params; // documentId
    validateId(id);
    const { email, permission } = req.body;
    
    if (!email || !email.includes('@')) {
      const error = new Error('Valid email is required');
      error.statusCode = 400;
      throw error;
    }

    const share = await shareService.shareDocument(id, req.user.id, email.trim(), permission);
    res.status(200).json({ share });
  } catch (error) {
    next(error);
  }
};

const revokeShare = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    validateId(id);
    validateId(userId);
    await shareService.revokeShare(id, req.user.id, userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const listSharedWithMe = async (req, res, next) => {
  try {
    const documents = await shareService.listSharedWithMe(req.user.id);
    res.json({ documents });
  } catch (error) {
    next(error);
  }
};

const listShares = async (req, res, next) => {
  try {
    const { id } = req.params;
    validateId(id);
    const shares = await shareService.listSharesForDocument(id, req.user.id);
    res.json({ shares });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  shareDocument,
  revokeShare,
  listSharedWithMe,
  listShares
};
