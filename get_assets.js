'use strict';

import * as fs from 'node:fs/promises';
import * as https from 'node:https';

await fs.mkdir('assets/', { recursive: true });

let cache = new Map();
function callEndpoint(endpoint) {
    if (cache.has(endpoint)) {
        return Promise.resolve(cache.get(endpoint));
    }
    console.log('Calling endpoint: ' + endpoint);
    let call = new Promise((resolve, reject) => {
        https.get(endpoint, res => {
            if (res.statusCode == 404) {
                resolve(undefined);
            } else if (res.statusCode != 200) {
                reject('Status Code: ' + res.statusCode);
            } else {
                resolve(res);
            }
        }).on('error', e => reject(e));
    });
    return call;
}

let data = JSON.parse(await fs.readFile('data.json', { encoding: 'utf8'}));
for (let pokemon of data.pokemon) {
    let image = await callEndpoint(pokemon.sprite);
    fs.writeFile('assets/' + pokemon.id + '.png', image);
}
