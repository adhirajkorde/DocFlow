const documentService = require('../services/document.service');
const importService = require('../services/import.service');

const validateId = (id) => {
  if (!id || typeof id !== 'string' || id.length < 5) {
    const error = new Error('Invalid document ID');
    error.statusCode = 400;
    throw error;
  }
};

const create = async (req, res, next) => {
  try {
    const { title } = req.body;
    const document = await documentService.createDocument(req.user.id, title.trim());
    res.status(201).json({ document });
  } catch (error) {
    next(error);
  }
};

const list = async (req, res, next) => {
  try {
    const documents = await documentService.listOwnedDocuments(req.user.id);
    res.json({ documents });
  } catch (error) {
    next(error);
  }
};

const get = async (req, res, next) => {
  try {
    const { id } = req.params;
    validateId(id);
    const document = await documentService.getDocumentById(id, req.user.id);
    res.json({ document });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    validateId(id);
    
    const { title, content } = req.body;
    const data = {};
    
    if (title !== undefined) {
      data.title = title.trim();
    }
    
    if (content !== undefined) {
      data.content = String(content);
    }

    const document = await documentService.updateDocument(id, req.user.id, data);
    res.json({ document });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    validateId(id);
    await documentService.deleteDocument(id, req.user.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const importDocument = async (req, res, next) => {
  try {
    const document = await importService.importFile(req.user.id, req.file);
    res.status(201).json({ document });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  list,
  get,
  update,
  remove,
  importDocument,
};
