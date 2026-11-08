const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict'), path = require('node:path');
const code = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
const c = {};
vm.createContext(c);
for (const name of ['jpIndexCardTitles', 'scryfallNameQuery', 'buildLocalIndexScryfallQueryChunks']) {
  const start = code.indexOf(`function ${name}(`);
  assert(start >= 0, name);
  vm.runInContext(code.slice(start, code.indexOf('\n}', start) + 2), c);
}
// 170 long names, as a common Japanese word like 天使 finds, go out in a handful of queries, each under Scryfall's limit.
const items = Array.from({ length: 170 }, (_, i) => ({ scryfallName: `Angel of Somewhat Long Name ${i}` }));
const queries = Array.from(c.buildLocalIndexScryfallQueryChunks(items, 'game:paper'));
assert(queries.length <= 10, `queries: ${queries.length}`);
assert(queries.every(q => q.length <= 800), 'a query is over 800 characters');
assert(queries.every(q => q.endsWith(') game:paper')));
// Every name is asked for exactly once.
const asked = queries.join(' ').match(/!"[^"]+"/g);
assert.equal(asked.length, 170);
assert.equal(new Set(asked).size, 170);
// Short names stop at 30 per query.
const short = Array.from(c.buildLocalIndexScryfallQueryChunks(Array.from({ length: 65 }, (_, i) => ({ scryfallName: `A${i}` })), ''));
assert.deepEqual(short.map(q => q.match(/!"/g).length), [30, 30, 5]);
// The count of Japanese results follows the name shown, and the search shows early results while it continues.
assert(code.includes('const jaCount = displayedCards.filter(card => isJapanese(nameOf(card))).length;'));
assert(code.includes('onProgress(orderedCards())'));
console.log('PASS search chunks stay under the query limit');
