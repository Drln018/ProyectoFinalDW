const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('./models/GestionUsers.js');
const { check, validationResult } = require('express-validator');
const cors = require('cors');

const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Cisneros2001',
  database: 'usersmysql',
  waitForConnections: true,
  connectionLimit: 40,
  queueLimit: 0,
});

const mysqlConnection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Cisneros2001',
  database: 'usersmysql',
});

mysqlConnection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL database');
});

const uri = 'mongodb://127.0.0.1:27017/usuariosDB';

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((err) => {
    console.error(err);
  });

router.use(cors());

router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener los usuarios');
  }
});

router.get('/userssql', async (req, res) => {
  try {
    const sql = 'SELECT * FROM perfiles';
    mysqlConnection.query(sql, (error, results, fields) => {
      if (error) {
        console.error(error);
        return res.status(500).send('Error al obtener los usuarios de MySQL');
      }
      res.status(200).json(results);
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener los usuarios');
  }
});

router.post(
  '/login',
  [
    check('email', 'El correo electrónico es obligatorio').isEmail(),
    check('password', 'La contraseña es obligatoria').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ message: 'Credenciales inválidas' });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ message: 'Credenciales inválidas' });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };

      const jwtSecret = 'tu_secreto_jwt';

      jwt.sign(payload, jwtSecret, { expiresIn: '1h' }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error en el servidor');
    }
  }
);

router.post(
  '/users',
  [
    check('username', 'El nombre de usuario es obligatorio').not().isEmpty(),
    check('email', 'El correo electrónico no es válido').isEmail(),
    check('password', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 }),
    check('role', 'El rol es obligatorio').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const newUser = new User(req.body);

      const salt = await bcrypt.genSalt(10);
      newUser.password = await bcrypt.hash(newUser.password, salt);

      await newUser.save();
      const profileData = {
        user_id: newUser._id,
        full_name: req.body.username,
        date_of_birth: req.body.date_of_birth,
      };

      const sql = 'INSERT INTO perfiles SET ?';
      mysqlConnection.query(sql, profileData, (error, results, fields) => {
        if (error) {
          return console.error(error.message);
        }
        console.log('Rows affected:', results.affectedRows);
      });

      res.status(201).json(newUser);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error al guardar el usuario');
    }
  }
);

router.put(
  '/users/:id',
  [
    check('username', 'El nombre de usuario es obligatorio').not().isEmpty(),
    check('email', 'El correo electrónico no es válido').isEmail(),
    check('role', 'El rol es obligatorio').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const userId = req.params.id;
      const { username, email, role } = req.body;

      await User.findByIdAndUpdate(userId, { username, email, role });

      const { full_name, date_of_birth } = req.body;
      const updateProfileSql = 'UPDATE perfiles SET full_name = ?, date_of_birth = ? WHERE user_id = ? ';
      mysqlConnection.query(updateProfileSql, [full_name, date_of_birth, userId], (error, results) => {
        if (error) {
          return console.error(error.message);
        }
        console.log('Rows affected for profile:', results.affectedRows);

        res.status(200).json({ message: 'Usuario y perfil actualizados correctamente' });
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error al actualizar el usuario y perfil');
    }
  }
);

router.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByIdAndRemove(userId);

    if (!user) {
      return res.status(404).send('Usuario no encontrado');
    }

    const sql = 'DELETE FROM perfiles WHERE user_id = ?';
    mysqlConnection.query(sql, [userId], (error, results) => {
      if (error) {
        console.error(error.message);
        return res.status(500).send('Error al eliminar el perfil del usuario en MySQL');
      }
      console.log('Perfil del usuario eliminado en MySQL');
    });

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al eliminar el usuario');
  }
});

module.exports = router;
