var superagent = require('superagent');
var cheerio = require('cheerio');
var Client = require('pg').Client;

let $;
const sst = [];

const grade = process.argv[2];
const gradeQuery = grade ? grade.replace('+', '%2B') : 'A';

const client = new Client({
  database: 'music_data'
});

client.connect();

superagent.get('http://robertchristgau.com/get_gl.php?g=' + gradeQuery)
  .then(res => {
    $ = cheerio.load(res.text);
    const list = $('ul').eq(0).find('li').each(processEntry);
  })
  .catch(e => console.log(e.message))


function processEntry(idx, el) {
  const name = $(el.children[2]).text();
  const artist = $(el.children[0]).text().replace(':','');
  const info = $(el.children[3]).text().trim().replace(/\[|\]/g, '').split(', ');

  const values = [name, artist, info[0], info[1], grade];
  client.query('INSERT INTO albums (name, artist, year, label, grade) VALUES($1, $2, $3, $4, $5)', values)
    .then(res => console.log('added'));
}
