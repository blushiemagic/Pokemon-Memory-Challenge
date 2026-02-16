'use strict';

const fs = require('fs/promises');
const sharp = require('sharp');

async function main() {
    let files = await fs.readdir('assets');
    for (let file of files) {
        await sharp('assets/' + file).resize(32, 32).toFile('assets/_' + file);
        await fs.rename('assets/_' + file, 'assets/' + file);
    }
}

main();