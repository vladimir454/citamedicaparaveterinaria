        // Función para mostrar mensajes personalizados (reemplazo de alert)
        function showCustomMessage(title, message, isError = false) {
            const modalTitle = document.getElementById('customMessageModalLabel');
            const modalBody = document.getElementById('customMessageModalBody');
            modalTitle.textContent = title;
            modalBody.innerHTML = message; // Usar innerHTML para permitir HTML básico si es necesario

            const modal = new bootstrap.Modal(document.getElementById('customMessageModal'));
            modal.show();
        }

        // Función para mostrar toasts (notificaciones pequeñas)
        function showToast(message, isError = false) {
            const toastContainer = document.getElementById('toastContainer');
            const toastElement = document.createElement('div');
            toastElement.className = `toast ${isError ? 'error' : ''} d-flex align-items-center text-white bg-${isError ? 'danger' : 'success'} border-0`;
            toastElement.setAttribute('role', 'alert');
            toastElement.setAttribute('aria-live', 'assertive');
            toastElement.setAttribute('aria-atomic', 'true');
            toastElement.innerHTML = `
                <div class="d-flex">
                    <div class="toast-body">
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            `;
            toastContainer.appendChild(toastElement);

            const bsToast = new bootstrap.Toast(toastElement, { delay: 3000 });
            bsToast.show();

            toastElement.addEventListener('hidden.bs.toast', () => {
                toastElement.remove();
            });
        }

        // Función para alternar la visibilidad de la contraseña
        function togglePasswordVisibility(id) {
            const passwordInput = document.getElementById(id);
            const toggleIcon = passwordInput.nextElementSibling.querySelector('i'); // Asumiendo que el ícono es el siguiente hermano

            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                toggleIcon.classList.remove('fa-eye');
                toggleIcon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                toggleIcon.classList.remove('fa-eye-slash');
                toggleIcon.classList.add('fa-eye');
            }
        }

        // Simulación de base de datos de usuarios en localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        let loggedInUser = null; // Para guardar el usuario que ha iniciado sesión

        // Validación de contraseña con expresiones regulares
        function validatePassword(password) {
            // Exactamente 8 caracteres, al menos una mayúscula, un número y un símbolo especial.
            const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8}$/;
            return regex.test(password);
        }

        // --- Funcionalidad de Creación de Cuenta ---
        document.getElementById('registerForm').addEventListener('submit', function(event) {
            event.preventDefault(); // Evitar el envío del formulario

            const username = document.getElementById('registerUsername').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;

            // Validar si el usuario o correo ya existen
            if (users.some(user => user.username === username)) {
                showToast('El nombre de usuario ya está en uso.', true);
                return;
            }
            if (users.some(user => user.email === email)) {
                showToast('El correo electrónico ya está registrado.', true);
                return;
            }

            // Validar contraseña
            if (!validatePassword(password)) {
                showToast('La contraseña no cumple los requisitos: 8 caracteres, al menos una mayúscula, un número y un símbolo especial.', true);
                return;
            }

            // Guardar nuevo usuario
            users.push({ username, email, password });
            localStorage.setItem('users', JSON.stringify(users));

            showToast('¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.');
            document.getElementById('login-tab').click(); // Cambiar a la pestaña de login
            this.reset(); // Limpiar formulario
        });

        // --- Funcionalidad de Inicio de Sesión ---
        document.getElementById('loginForm').addEventListener('submit', function(event) {
            event.preventDefault(); // Evitar el envío del formulario

            const loginIdentifier = document.getElementById('loginEmail').value; // Puede ser email o username
            const password = document.getElementById('loginPassword').value;

            // Buscar usuario por email o username y verificar contraseña
            const user = users.find(u => (u.email === loginIdentifier || u.username === loginIdentifier) && u.password === password);

            if (user) {
                loggedInUser = user; // Guardar el usuario logueado
                showToast('¡Inicio de sesión exitoso!');
                // Redirigir a la página principal
                document.getElementById('auth-section').classList.add('d-none');
                document.getElementById('main-section').classList.remove('d-none');
                // Actualizar datos de usuario en la página principal
                document.getElementById('displayMyUsername').textContent = loggedInUser.username;
                document.getElementById('displayMyEmail').textContent = loggedInUser.email;
                this.reset(); // Limpiar formulario
            } else {
                showToast('Credenciales incorrectas. Por favor, verifica tu usuario/correo y contraseña.', true);
            }
        });

        // --- Funcionalidad de ¿Olvidaste tu contraseña? ---
        document.getElementById('forgotPasswordLink').addEventListener('click', function(event) {
            event.preventDefault();
            showCustomMessage('Recuperación de Contraseña', 'Se ha enviado un enlace de recuperación a tu correo electrónico registrado. (Simulación)');
        });

        // --- Funcionalidad de Cerrar Sesión ---
        document.getElementById('logoutButton').addEventListener('click', function() {
            loggedInUser = null; // Limpiar el usuario logueado
            showToast('Has cerrado sesión.');
            document.getElementById('main-section').classList.add('d-none');
            document.getElementById('auth-section').classList.remove('d-none');
            document.getElementById('login-tab').click(); // Volver a la pestaña de login
        });

        // --- Funcionalidad de Agendar Cita Médica ---
        document.getElementById('appointmentForm').addEventListener('submit', function(event) {
            event.preventDefault(); // Evitar el envío del formulario

            const ownerName = document.getElementById('ownerName').value;
            const petName = document.getElementById('petName').value;
            const appointmentDateTime = document.getElementById('appointmentDateTime').value;
            const symptoms = document.getElementById('symptoms').value;

            // Generar número de ficha aleatorio
            const fichaNumber = Math.floor(1000 + Math.random() * 9000); // Número de 4 dígitos

            // Formatear fecha y hora para el mensaje
            const dateTimeObj = new Date(appointmentDateTime);
            const optionsDate = { year: 'numeric', month: 'long', day: 'numeric' };
            const optionsTime = { hour: '2-digit', minute: '2-digit' };
            const emailDate = dateTimeObj.toLocaleDateString('es-ES', optionsDate);
            const emailTime = dateTimeObj.toLocaleTimeString('es-ES', optionsTime);

            // Mostrar los datos registrados en pantalla
            document.getElementById('displayOwnerName').textContent = ownerName;
            document.getElementById('displayPetName').textContent = petName;
            document.getElementById('displayAppointmentDateTime').textContent = `${emailDate} a las ${emailTime}`;
            document.getElementById('displaySymptoms').textContent = symptoms;
            document.getElementById('displayFichaNumber').textContent = fichaNumber;
            document.getElementById('displayEmailDate').textContent = emailDate;
            document.getElementById('displayEmailTime').textContent = emailTime;

            document.getElementById('appointmentDetails').classList.remove('d-none');
            showToast('¡Cita agendada con éxito!');
            this.reset(); // Limpiar formulario
        });

        // Asegurarse de que el formulario de cita tiene validaciones en tiempo real (HTML5 + Bootstrap)
        // Puedes agregar más validaciones con JS aquí si es necesario, por ejemplo:
        document.getElementById('appointmentDateTime').addEventListener('input', function() {
            const selectedDate = new Date(this.value);
            const now = new Date();
            if (selectedDate < now) {
                this.setCustomValidity('La fecha y hora no pueden ser en el pasado.');
            } else {
                this.setCustomValidity('');
            }
        });

        
        // --- Funcionalidad para mostrar la lista de citas en Reportes ---
        function renderAppointmentsList() {
            const appointmentListDiv = document.getElementById('appointmentList');
            appointmentListDiv.innerHTML = ''; // Limpiar la lista existente

            if (appointments.length === 0) {
                appointmentListDiv.innerHTML = '<p class="text-muted">No hay citas registradas aún.</p>';
                return;
            }

            // Ordenar citas por fecha y hora más reciente primero
            const sortedAppointments = [...appointments].sort((a, b) => new Date(b.appointmentDateTime) - new Date(a.appointmentDateTime));

            sortedAppointments.forEach(appointment => {
                const appointmentCard = document.createElement('div');
                appointmentCard.className = 'appointment-card';
                appointmentCard.innerHTML = `
                    <p><strong>Número de Ficha:</strong> ${appointment.fichaNumber}</p>
                    <p><strong>Dueño:</strong> ${appointment.ownerName}</p>
                    <p><strong>Mascota:</strong> ${appointment.petName}</p>
                    <p><strong>Fecha:</strong> ${appointment.displayDate}</p>
                    <p><strong>Hora:</strong> ${appointment.displayTime}</p>
                    <p><strong>Síntomas:</strong> ${appointment.symptoms}</p>
                `;
                appointmentListDiv.appendChild(appointmentCard);
            });
        }

        // Cargar las citas cuando se navega a la pestaña de reportes
        document.getElementById('nav-reportes-tab').addEventListener('shown.bs.tab', function (event) {
            renderAppointmentsList();
        });
