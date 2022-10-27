'use strict';

const server = require('./index');
const PORT = 3000;

server.listen(PORT, () => console.log(`Server listen on http://localhost:${PORT}`));
