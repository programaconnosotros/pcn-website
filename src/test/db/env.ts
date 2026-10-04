// Corre antes que cualquier import de los tests: @/lib/prisma lee DATABASE_URL al crearse, así
// que tiene que ver ya la base de tests y no la de desarrollo.
const { testDatabaseUrl } = require('./database.cjs');

process.env.DATABASE_URL = testDatabaseUrl();
delete process.env.DIRECT_URL;
