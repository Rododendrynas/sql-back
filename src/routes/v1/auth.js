/* eslint-disable newline-per-chained-call */
const express = require('express');
const mysql = require('mysql2/promise');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { dbConfig, jwtSecret } = require('../../config');

const router = express.Router();

// Validation of user registration and login data
const userSchemaRegister = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().trim().lowercase().required(),
  password: Joi.string().required(),
});

const userSchemaLogin = Joi.object({
  email: Joi.string().email().trim().lowercase().required(),
  password: Joi.string().required(),
});

// Register
router.post('/register', async (req, res) => {
  let userDetails = req.body;
  console.log(userDetails);
  try {
    userDetails = await userSchemaRegister.validateAsync(userDetails);
  } catch (err) {
    console.log(err);
    return res.status(400).send({ err: 'Incorrect input format.' });
  }

  try {
    const hashedPassword = await bcrypt.hashSync(userDetails.password);
    const con = await mysql.createConnection(dbConfig);

    await con.execute(`
        INSERT INTO users (full_name, email, password)
        VALUES (${mysql.escape(userDetails.name)}, 
        ${mysql.escape(userDetails.email)}, '${hashedPassword}')
    `);
    await con.end();
    return res.status(200).send({ msg: 'Registered' });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err: 'Issue. Try again' });
  }
});

// Login
router.post('/login', async (req, res) => {
  let userDetails = req.body;

  try {
    userDetails = await userSchemaLogin.validateAsync(userDetails);
  } catch (err) {
    console.log(err);
    return res.status(400).send({ err: 'Incorrect email or password' });
  }

  try {
    const con = await mysql.createConnection(dbConfig);
    const [data] = await con.execute(`
          SELECT * FROM users 
          WHERE email =  (${mysql.escape(userDetails.email)})
          LIMIT 1
      `);

    await con.end();

    const passwordCorrect = await bcrypt.compareSync(
      userDetails.password,
      data[0].password,
    );

    if (!passwordCorrect) {
      return res.status(400).send({ err: 'Incorrect email or password' });
    }

    const token = jwt.sign({ id: data[0].id, email: data[0].email }, jwtSecret);
    return res.send({ msg: 'Successfully logged in', token });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err: 'Incorrect data. Try again' });
  }
});

module.exports = router;
