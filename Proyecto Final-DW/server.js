const express = require('express');
const api = require('./api');

const port = 3000;
const app = express();

app.listen(port, function () {
    console.log('Escuchando peticiones en el puerto ' + port);
});

// Analiza el texto como datos codificados en la URL para usarlos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define la ruta
app.use('/api', api);
