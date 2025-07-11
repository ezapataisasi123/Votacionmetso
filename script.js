// script.js
// Importa las funciones necesarias del SDK de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getFirestore, collection, doc, runTransaction } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
// No importamos getAnalytics si no lo usas en este archivo

document.addEventListener('DOMContentLoaded', () => {
    // TU CONFIGURACIÓN DE FIREBASE (PEGA AQUÍ EL OBJETO firebaseConfig)
    const firebaseConfig = {
        apiKey: "AIzaSyDdRM-0ZAK0-u0RJpSem1xTg8xGiHh3Hv8",
        authDomain: "votacionmetso.firebaseapp.com",
        projectId: "votacionmetso",
        storageBucket: "votacionmetso.firebasestorage.app",
        messagingSenderId: "624381957218",
        appId: "1:624381957218:web:1a594ca0071dd46366ed3b",
        measurementId: "G-TLQ2WKJF8C" // Puedes omitir measurementId si no usas Analytics aquí
    };

    // Inicializa Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app); // Obtén una instancia de Firestore

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

                // Usa las funciones importadas: doc y collection
                const votoRef = doc(collection(db, 'votos'), docId); 

                // Usa la función importada: runTransaction
                await runTransaction(db, async (transaction) => { // runTransaction ahora recibe 'db' como primer argumento
                    const currentDoc = await transaction.get(votoRef);
                    if (!currentDoc.exists()) { // Usar .exists() para verificar si el documento existe
                        transaction.set(votoRef, { count: 1 });
                    } else {
                        const newCount = currentDoc.data().count + 1;
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