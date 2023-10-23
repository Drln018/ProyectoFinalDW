const baseUrl = 'http://localhost:3000/api/users'; // Cambia la URL según tu configuración
const usuariosList = document.getElementById('usuarios-list');
const usuarioForm = document.getElementById('usuario-form');

// Helper function para hacer peticiones
async function makeRequest(url, method, data = null) {
    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: data ? JSON.stringify(data) : null,
        });

        if (!response.ok) {
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error(error);
    }
}

// Cargar lista de usuarios en mysql con el metodo get de userql que esta en api.js
async function loadUsuarios() {
    usuariosList.innerHTML = '';
    try {
        const usuarios = await makeRequest(baseUrl, 'GET');
        usuarios.forEach((usuario) => {
            const usuarioDiv = createUsuarioElement(usuario);
            usuariosList.appendChild(usuarioDiv);
        });
    } catch (error) {
        console.error(error);
        usuariosList.textContent = 'Error al cargar la lista de usuarios.';
    }
}

window.addEventListener('DOMContentLoaded', () => {
    loadUsuarios();
}
);