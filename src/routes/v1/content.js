const express = require('express');
const mysql = require('mysql2/promise');
const { dbConfig } = require('../../config');

const router = express.Router();

const { isLoggedIn } = require('../../middleware');

// GET all groups
router.get('/groups/', isLoggedIn, async (req, res) => {
  try {
    const con = await mysql.createConnection(dbConfig);

    const [data] = await con.execute(`
        SELECT * FROM cao_groups
    `);
    await con.end();
    return res.send(data);
  } catch (err) {
    return res
      .status(500)
      .send({ err: 'Issue by getting list of groups. Try again' });
  }
});

// ADD a group to the database
router.post('/groups/', isLoggedIn, async (req, res) => {
  const groupDetails = req.body;

  try {
    const con = await mysql.createConnection(dbConfig);

    await con.execute(`
        INSERT INTO cao_groups (name)
        VALUES (${mysql.escape(groupDetails.id)})
    `);

    await con.end();

    return res.status(200).send({
      msg: `Group ${groupDetails.id} created. Please refresh your page.`,
    });
  } catch (err) {
    return res.status(500).send({
      err: 'Issue by creating a group. Group name is expected to be an unique number. Try again.',
    });
  }
});

module.exports = router;
