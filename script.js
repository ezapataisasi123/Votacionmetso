document.addEventListener('DOMContentLoaded', () => {
    // TU CONFIGURACIÓN DE FIREBASE (PEGA AQUÍ EL OBJETO firebaseConfig DEL PASO 1)
    const firebaseConfig = {
        apiKey: "AIzaSyDdRM-0ZAK0-u0RJpSem1xTg8xGiHh3Hv8",
        authDomain: "votacionmetso.firebaseapp.com",
        projectId: "votacionmetso",
        storageBucket: "votacionmetso.firebasestorage.app",
        messagingSenderId: "624381957218",
        appId: "1:624381957218:web:1a594ca0071dd46366ed3b",
        measurementId: "G-TLQ2WKJF8C"
    };

    // Inicializa Firebase
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore(); // Obtén una instancia de Firestore

    const votingForm = document.getElementById('votingForm');
    const mensajeVotado = document.getElementById('mensajeVotado');

    if (localStorage.getItem('hasVoted') === 'true') {
        mostrarMensajeVotado();
    }

    // ... (Lógica para permitir solo un checkbox por categoría - esta parte ya la tienes y funciona) ...
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

    votingForm.addEventListener('submit', async (event) => { // Agrega 'async' aquí
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
            // Iterar sobre las selecciones y actualizar Firestore
            for (const seleccion of seleccionados) {
                const categoria = seleccion.name;
                const participante = seleccion.value; // ¡Recuerda arreglar los valores duplicados!
                const docId = `${categoria}-${participante}`; // ID del documento en Firestore

                const votoRef = db.collection('votos').doc(docId);

                // Usar una transacción para incrementar de forma segura
                await db.runTransaction(async (transaction) => {
                    const doc = await transaction.get(votoRef);
                    if (!doc.exists) {
                        transaction.set(votoRef, { count: 1 }); // Si no existe, lo crea con 1 voto
                    } else {
                        const newCount = doc.data().count + 1;
                        transaction.update(votoRef, { count: newCount }); // Si existe, incrementa el contador
                    }
                });
            }

            localStorage.setItem('hasVoted', 'true');
            mostrarMensajeVotado();
            alert('¡Voto enviado con éxito! Gracias por participar.');

        } catch (error) {
            console.error("Error al enviar el voto a Firebase:", error);
            alert('Hubo un error al registrar tu voto. Inténtalo de nuevo.');
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