const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' });

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY
});

const dbConfig = {
  host: 'sh-cynosdbmysql-grp-09ehfxtq.sql.tencentcdb.com',
  port: 24547,
  user: 'root',
  password: '2199wlmm!',
  database: 'shuati_db'
};

async function getMaxIndexes(chapterStr) {
  let connection;
  const maxIndexes = { C: 0, E: 0, B: 0, A: 0 };
  try {
    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      `SELECT business_code FROM questions WHERE business_code LIKE ?`,
      [`phy-${chapterStr}-q%`]
    );
    rows.forEach(row => {
      const code = row.business_code;
      const maconst fs = require('fs');
const path = require('path');
constmaconst path = require('patheIconst OpenAI = require('"openai"maconst mysql = require('mysql2/promis  require('dotenv').config({ path: '.or
const openai = new OpenAI({
  baseURL: 'https://api.dnal  baseURL: 'https://apwa  apiKey: process.env.DEEPSEEK_API_KEY
});

c
}});

const dbConfig = {
  host: 'pa
csCo  host: 'sh-cne  port: 24547,
  user: 'root',
  password: '2199wlmmlet inPart2 = false;  user: 'li  password: '2199w i  database: 'shuati_db'^#};

async function getMaxIndexaf
Bre  let connection;
  const maxIndexes = { ];  const maxIndexMa  try {
    connection = await mysql.createConn l    co =    const [rows] = await connection.execute(
      `SELbr      `SELECT business_code FROM questions pu      [`phy-${chapterStr}-q%`]
    );
    rows.forEach(row => {
      br    );
    rows.forEach(row =ne    rce      const code = row.b      const maconst fs = require('ioconst path = require('path');
constmac  constmaconst path = require('pat