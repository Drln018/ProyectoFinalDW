// Variables globales
let baseUrl = 'http://localhost:3000/api/users'; // Ruta inicial (MongoDB)
let baseUrle = 'http://localhost:3000/api/userssql'; // Ruta inicial (MySQL)
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

// Cargar lista de usuarios desde la ruta actual
async function loadUsuarios() {
    usuariosList.innerHTML = '';
    try {
        const usuarios = await makeRequest(baseUrl, 'GET');
        const usuariosmysql = await makeRequest(baseUrle, 'GET');
        // Procesa la respuesta y muestra los usuarios
        let index = 0;
        usuarios.forEach((usuario) => {
            const usuarioDiv = createUsuarioElement(usuario);
            usuariosList.appendChild(usuarioDiv);

            if (usuariosmysql[index]) {
                const usuarioMysqlDiv = mysql(usuariosmysql[index]);
                usuariosList.appendChild(usuarioMysqlDiv);
                index++;
            }
        });
    } catch (error) {
        console.error(error);
        usuariosList.textContent = 'Error al cargar la lista de usuarios.';
    }
}


// Función para agregar un nuevo usuario
usuarioForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const roleInput = document.getElementById('role');
    const dateOfBirthInput = document.getElementById('date-of-birth');

    const nuevoUsuario = {
        username: usernameInput.value,
        email: emailInput.value,
        password: passwordInput.value,
        role: roleInput.value,
        date_of_birth: dateOfBirthInput.value,
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
        dateOfBirthInput.value = '';
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



    const editButton = document.createElement('button');
    editButton.textContent = 'Editar';
    editButton.classList.add('edit-button');
    editButton.addEventListener('click', () => handleEdit(usuario));

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Eliminar';
    deleteButton.classList.add('delete-button');
    deleteButton.addEventListener('click', () => handleDelete(usuario._id));


    usuarioDiv.appendChild(username);
    usuarioDiv.appendChild(editButton);
    usuarioDiv.appendChild(deleteButton);
    usuarioDiv.appendChild(email);
    usuarioDiv.appendChild(role);


    return usuarioDiv;
}

// Función para crear elementos de usuario con botones de editar y eliminar
function mysql(usuario) {
    const usuarioDiv = document.createElement('div');
    usuarioDiv.classList.add('usuario-item');
    usuarioDiv.id = `${usuario._id}`;


        const fullName = document.createElement('p');
        fullName.textContent = `Nombre completo: ${usuario.full_name}`;

    
        const dateOfBirth = document.createElement('p');
        dateOfBirth.textContent = `Fecha de nacimiento: ${usuario.date_of_birth}`;

        usuarioDiv.appendChild(fullName);
        usuarioDiv.appendChild(dateOfBirth);


    return usuarioDiv;
}



// Función para manejar la eliminación de un usuario
async function handleDelete(usuarioId) {
    const confirmDelete = confirm('¿Estás seguro de que quieres eliminar este usuario?');

    if (confirmDelete) {
        try {
            await makeRequest(`${baseUrl}/${usuarioId}`, 'DELETE');
            // Actualizar la lista de usuarios después de la eliminación
            loadUsuarios();
        } catch (error) {
            console.error(error);
            // Manejar errores si es necesario
        }
    }
}
// Función para manejar la edición de un usuario
function handleEdit(usuario) {
    // Encuentra el usuario en la lista de usuarios (puedes usar su ID)
    const usuarioDiv = usuariosList.querySelector(`[id="${usuario._id}"]`);

    // Verifica si el elemento principal del usuario existe
    if (usuarioDiv) {
        // Crea un formulario de edición
        const editForm = document.createElement('form');
        editForm.innerHTML = `
            <input type="text" id="edit-username" value="${usuario.username}" required>
            <input type="email" id="edit-email" value="${usuario.email}" required>
            <input type="text" id="edit-role" value="${usuario.role}" required>
            <input type="date" id="edit-date-of-birth" value="${usuario.date_of_birth}" required>
            <input type="text" id="edit-full-name" value="${usuario.full_name}" required>
            <button type="submit">Guardar</button>
        `;

        // Agrega el formulario de edición al elemento principal del usuario
        usuarioDiv.appendChild(editForm);

        // Maneja el envío del formulario de edición
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const editUsernameInput = document.getElementById('edit-username');
            const editEmailInput = document.getElementById('edit-email');
            const editRoleInput = document.getElementById('edit-role');
            const editDateOfBirthInput = document.getElementById('edit-date-of-birth');
            const editFullNameInput = document.getElementById('edit-full-name');

            
            const editedUsername = editUsernameInput.value;
            const editedEmail = editEmailInput.value;
            const editedRole = editRoleInput.value;
            const editedDateOfBirth = editDateOfBirthInput.value;
            const editedFullName = editFullNameInput.value;

            try {
                // Envía una solicitud PUT para actualizar el usuario en el API
                const editedUsuario = await makeRequest(`${baseUrl}/${usuario._id}`, 'PUT', {
                    username: editedUsername,
                    email: editedEmail,
                    role: editedRole,
                    date_of_birth: editedDateOfBirth,
                    full_name: editedFullName,
                });

                // Actualiza la información en la interfaz con los datos actualizados del servidor
                usuario.username = editedUsuario.username;
                usuario.email = editedUsuario.email;
                usuario.role = editedUsuario.role;
                usuario.date_of_birth = editedUsuario.date_of_birth;
                usuario.full_name = editedUsuario.full_name;

                // Borra el formulario de edición
                editForm.remove();
            } catch (error) {
                console.error(error);
                // Muestra un mensaje de error si es necesario
            }
        });
    }
}
// Cargar lista de usuarios cuando se carga la página
window.addEventListener('load', loadUsuarios);

