const loginForm = document.getElementById("login-form");
const baseUrl = "http://localhost:3000/api"; // Agrega la URL base de tu API

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value; // Obtiene el valor del rol

    try {
        const response = await fetch(`${baseUrl}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password, role }), // Incluye el rol en el cuerpo
        });

        if (response.status === 200) {
            // Éxito en el inicio de sesión, redirige según el rol
            if (role === "administrador") {
                window.location.href = "/web/administradores.html"; // Redirige a la página de administrador
            } else {
                window.location.href = "/web/index.html"; // Redirige a la página de usuario normal
            }
        } else {
            // Error en el inicio de sesión
            console.error("Inicio de sesión fallido.");
        }
    } catch (error) {
        console.error("Error en la solicitud:", error);
    }
});
