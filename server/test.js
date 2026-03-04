import fs from 'fs';
import('./index.js').catch(e => {
    fs.writeFileSync('THE_ERROR.txt', e.stack || e.toString());
});
