const prisma = require('./backend/src/config/db.js');
prisma.document.findMany({
  orderBy: { updatedAt: 'desc' }
}).then(console.log).catch(console.error).finally(() => prisma.$disconnect());
