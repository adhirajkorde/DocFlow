const prisma = require('../config/db');

const createDocument = async (ownerId, title) => {
  return await prisma.document.create({
    data: {
      title,
      ownerId,
      content: '',
    },
  });
};

const listOwnedDocuments = async (ownerId) => {
  return await prisma.document.findMany({
    where: { ownerId },
    orderBy: { updatedAt: 'desc' },
  });
};

const getDocumentById = async (documentId, userId) => {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: { shares: true },
  });

  if (!document) {
    const error = new Error('Document not found');
    error.statusCode = 404;
    throw error;
  }

  const isOwner = document.ownerId === userId;
  const userShare = document.shares.find(share => share.sharedWithUserId === userId);

  if (!isOwner && !userShare) {
    const error = new Error('Forbidden');
    error.statusCode = 403;
    throw error;
  }

  document.permission = isOwner ? 'owner' : userShare.permission;
  return document;
};

const updateDocument = async (documentId, userId, data) => {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: { shares: true },
  });

  if (!document) {
    const error = new Error('Document not found');
    error.statusCode = 404;
    throw error;
  }

  const isOwner = document.ownerId === userId;
  const userShare = document.shares.find(share => share.sharedWithUserId === userId);
  const isEdit = userShare && userShare.permission === 'edit';

  if (!isOwner && !isEdit) {
    const error = new Error('Forbidden: You do not have permission to edit this document');
    error.statusCode = 403;
    throw error;
  }

  if (data.title !== undefined && !isOwner) {
    const error = new Error('Forbidden: Only the owner can rename the document');
    error.statusCode = 403;
    throw error;
  }

  return await prisma.document.update({
    where: { id: documentId },
    data,
  });
};

const deleteDocument = async (documentId, userId) => {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    const error = new Error('Document not found');
    error.statusCode = 404;
    throw error;
  }

  if (document.ownerId !== userId) {
    const error = new Error('Forbidden: Only owner can delete');
    error.statusCode = 403;
    throw error;
  }

  await prisma.documentShare.deleteMany({
    where: { documentId },
  });

  return await prisma.document.delete({
    where: { id: documentId },
  });
};

module.exports = {
  createDocument,
  listOwnedDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
};
