const prisma = require('../config/db');

const shareDocument = async (documentId, ownerId, targetEmail, permission) => {
  if (permission !== 'view' && permission !== 'edit') {
    const error = new Error('Invalid permission');
    error.statusCode = 400;
    throw error;
  }

  const document = await prisma.document.findUnique({ where: { id: documentId } });
  if (!document) {
    const error = new Error('Document not found');
    error.statusCode = 404;
    throw error;
  }

  if (document.ownerId !== ownerId) {
    const error = new Error('Forbidden: Only the owner can share this document');
    error.statusCode = 403;
    throw error;
  }

  const targetUser = await prisma.user.findUnique({ where: { email: targetEmail } });
  if (!targetUser) {
    const error = new Error('No user found with that email');
    error.statusCode = 404;
    throw error;
  }

  if (targetUser.id === ownerId) {
    const error = new Error('You cannot share a document with yourself');
    error.statusCode = 400;
    throw error;
  }

  const existingShare = await prisma.documentShare.findUnique({
    where: {
      documentId_sharedWithUserId: {
        documentId: documentId,
        sharedWithUserId: targetUser.id
      }
    }
  });

  if (existingShare) {
    return await prisma.documentShare.update({
      where: { id: existingShare.id },
      data: { permission },
      include: { sharedWithUser: { select: { email: true, name: true, id: true } } }
    });
  } else {
    return await prisma.documentShare.create({
      data: {
        documentId,
        sharedWithUserId: targetUser.id,
        permission
      },
      include: { sharedWithUser: { select: { email: true, name: true, id: true } } }
    });
  }
};

const revokeShare = async (documentId, ownerId, targetUserId) => {
  const document = await prisma.document.findUnique({ where: { id: documentId } });
  if (!document || document.ownerId !== ownerId) {
    const error = new Error('Forbidden: Only the owner can manage shares');
    error.statusCode = 403;
    throw error;
  }

  try {
    await prisma.documentShare.delete({
      where: {
        documentId_sharedWithUserId: {
          documentId,
          sharedWithUserId: targetUserId
        }
      }
    });
  } catch (err) {
    // Ignore if not found
  }
};

const listSharedWithMe = async (userId) => {
  const shares = await prisma.documentShare.findMany({
    where: { sharedWithUserId: userId },
    include: {
      document: {
        include: {
          owner: { select: { name: true, email: true } }
        }
      }
    },
    orderBy: { document: { updatedAt: 'desc' } }
  });

  return shares.map(share => {
    return {
      ...share.document,
      permission: share.permission,
      ownerName: share.document.owner.name,
      ownerEmail: share.document.owner.email,
    };
  });
};

const listSharesForDocument = async (documentId, ownerId) => {
  const document = await prisma.document.findUnique({ where: { id: documentId } });
  if (!document || document.ownerId !== ownerId) {
    const error = new Error('Forbidden: Only the owner can view shares');
    error.statusCode = 403;
    throw error;
  }

  const shares = await prisma.documentShare.findMany({
    where: { documentId },
    include: {
      sharedWithUser: { select: { id: true, email: true, name: true } }
    }
  });

  return shares;
};

module.exports = {
  shareDocument,
  revokeShare,
  listSharedWithMe,
  listSharesForDocument
};
