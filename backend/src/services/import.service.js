const { marked } = require('marked');
const documentService = require('./document.service');
const path = require('path');

const escapeHtml = (unsafe) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const importFile = async (ownerId, file) => {
  let textContent = '';
  try {
    textContent = file.buffer.toString('utf8');
  } catch (err) {
    const error = new Error('Could not read file as text.');
    error.statusCode = 400;
    throw error;
  }

  const originalName = file.originalname || '';
  const parsedPath = path.parse(originalName);
  let baseName = parsedPath.name;
  baseName = baseName.replace(/[-_]/g, ' ').trim();
  
  if (!baseName) {
    baseName = 'Imported Document';
  } else if (baseName.length > 150) {
    baseName = baseName.substring(0, 150);
  }

  let htmlContent = '';
  const ext = parsedPath.ext.toLowerCase();

  if (ext === '.md') {
    try {
      htmlContent = marked.parse(textContent);
    } catch (err) {
      const error = new Error('Could not parse markdown file.');
      error.statusCode = 400;
      throw error;
    }
  } else if (ext === '.txt') {
    const escaped = escapeHtml(textContent);
    htmlContent = escaped.replace(/\r?\n/g, '<br/>');
  } else {
    const error = new Error('Unsupported file extension.');
    error.statusCode = 400;
    throw error;
  }

  const document = await documentService.createDocument(ownerId, baseName);
  
  if (htmlContent) {
    await documentService.updateDocument(document.id, ownerId, {
      content: htmlContent
    });
  }

  return await documentService.getDocumentById(document.id, ownerId);
};

module.exports = { importFile };
