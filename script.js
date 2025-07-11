// script.js
document.addEventListener('DOMContentLoaded', () => {
    // Ya no necesitas firebaseConfig ni inicializar Firebase aquí
    // Las variables 'app' y 'db' vienen de window
    const app = window.firebaseApp;
    const db = window.firebaseDb; 

    // Asegúrate de que 'db' esté disponible antes de usarlo
    if (!db) {
        console.error("Firebase Firestore no está inicializado. Asegúrate de que los scripts de Firebase se carguen primero en HTML.");
        alert("Error de configuración: No se pudo conectar con la base de datos.");
        return; // Detener la ejecución si Firebase no está listo
    }

    const votingForm = document.getElementById('votingForm');
    const mensajeVotado = document.getElementById('mensajeVotado');

    if (localStorage.getItem('hasVoted') === 'true') {
        mostrarMensajeVotado();
    }

    const categorias = document.querySelectorAll('.categoria');
    categorias.forEach(categoria => {
        const checkboxes = categoria.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    checkboxes.forEach(otherCheckbox => {
                        if (otherCheckbox !== checkbox) {
                            otherCheckbox.checked = false;
                        }
                    });
                }
            });
        });
    });

    votingForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (localStorage.getItem('hasVoted') === 'true') {
            alert('Ya has votado. No puedes votar de nuevo.');
            return;
        }

        const seleccionados = document.querySelectorAll('input[type="checkbox"]:checked');
        
        if (seleccionados.length === 0) {
            alert('Por favor, selecciona al menos una opción para votar.');
            return;
        }

        try {
            for (const seleccion of seleccionados) {
                const categoria = seleccion.name;
                const participante = seleccion.value;
                const docId = `${categoria}-${participante}`;

                const votoRef = db.collection('votos').doc(docId);

                await db.runTransaction(async (transaction) => {
                    const doc = await transaction.get(votoRef);
                    if (!doc.exists) {
                        transaction.set(votoRef, { count: 1 });
                    } else {
                        const newCount = doc.data().count + 1;
                        transaction.update(votoRef, { count: newCount });
                    }
                });
            }

            localStorage.setItem('hasVoted', 'true');
            mostrarMensajeVotado();
            alert('¡Voto enviado con éxito! Gracias por participar.');

        } catch (error) {
            console.error("Error al enviar el voto a Firebase:", error);
            alert('Hubo un error al registrar tu voto. Inténtalo de nuevo. Revisa la consola para más detalles.');
        }
    });

    function mostrarMensajeVotado() {
        if (votingForm) {
            votingForm.classList.add('oculto');
        }
        if (mensajeVotado) {
            mensajeVotado.classList.remove('oculto');
        }
    }
});