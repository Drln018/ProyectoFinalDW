// Variables globales
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

// Cargar lista de usuarios
async function loadUsuarios() {
    try {
        const usuarios = await makeRequest(baseUrl, 'GET');
        // Procesa la respuesta y muestra los usuarios
        usuariosList.innerHTML = '';
        usuarios.forEach((usuario) => {
            const usuarioDiv = createUsuarioElement(usuario);
            usuariosList.appendChild(usuarioDiv);
        });
    } catch (error) {
        console.error(error);
        // Muestra un mensaje de error si es necesario
    }
}

// Función para agregar un nuevo usuario
usuarioForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const roleInput = document.getElementById('role');

    const nuevoUsuario = {
        username: usernameInput.value,
        email: emailInput.value,
        password: passwordInput.value,
        role: roleInput.value,
    };

    try {
        const usuario = await makeRequest(baseUrl, 'POST', nuevoUsuario);
        // Procesa la respuesta y muestra el usuario agregado
        const usuarioDiv = createUsuarioElement(usuario);
        usuariosList.appendChild(usuarioDiv);

        // Limpia el formulario
        usernameInput.value = '';
        emailInput.value = '';
        passwordInput.value = '';
        roleInput.value = '';
    } catch (error) {
        console.error(error);
        // Muestra un mensaje de error si es necesario
    }
});


// Función para crear elementos de usuario con botones de editar y eliminar
function createUsuarioElement(usuario) {
    const usuarioDiv = document.createElement('div');
    usuarioDiv.classList.add('usuario-item');
    usuarioDiv.id = `${usuario._id}`;

    const username = document.createElement('h2');
    username.textContent = `Usuario: ${usuario.username}`;

    const email = document.createElement('p');
    email.textContent = `Email: ${usuario.email}`;

    const role = document.createElement('p');
    role.textContent = `Rol: ${usuario.role}`;


    usuarioDiv.appendChild(username);
    usuarioDiv.appendChild(email);
    usuarioDiv.appendChild(role);

    return usuarioDiv;
}




// Cargar lista de usuarios cuando se carga la página
window.addEventListener('load', loadUsuarios);