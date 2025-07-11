// resultados.js
// Importa las funciones necesarias del SDK de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getFirestore, collection, getDocs, deleteDoc, doc, onSnapshot, writeBatch } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
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

    const resultadosWrapper = document.getElementById('resultadosWrapper');
    const botonReiniciar = document.getElementById('reiniciarVotos');

    // --- LÓGICA DE ADMINISTRADOR ---
    const urlParams = new URLSearchParams(window.location.search);
    const isAdmin = urlParams.get('admin') === 'true';

    if (isAdmin) {
        if (botonReiniciar) {
            botonReiniciar.style.display = 'block';

            botonReiniciar.addEventListener('click', async () => {
                const confirmacion = confirm('¿Estás seguro de que deseas borrar TODOS los votos? Esta acción no se puede deshacer.');

                if (confirmacion) {
                    try {
                        // Usa las funciones importadas: collection y getDocs
                        const votosSnapshot = await getDocs(collection(db, 'votos'));
                        
                        // Usa la función importada: writeBatch
                        const batch = writeBatch(db); // writeBatch ahora recibe 'db'

                        votosSnapshot.docs.forEach(_doc => { // Cambiado 'doc' a '_doc' para evitar conflicto con la importación
                            batch.delete(_doc.ref);
                        });
                        await batch.commit();

                        localStorage.removeItem('hasVoted');

                        alert('¡Todas las votaciones han sido reiniciadas!');
                        location.href = 'resultados.html?admin=true'; // Mantener el admin tag
                    } catch (error) {
                        console.error("Error al reiniciar votos:", error);
                        alert('Hubo un error al reiniciar los votos. Inténtalo de nuevo. Revisa la consola para más detalles.');
                    }
                }
            });
        }
    }

    // --- LÓGICA PARA MOSTRAR RESULTADOS (Con listener en tiempo real de Firebase) ---
    // Usa la función importada: onSnapshot y collection
    onSnapshot(collection(db, 'votos'), (snapshot) => {
        const votos = {};
        snapshot.forEach(_doc => { // Cambiado 'doc' a '_doc'
            const data = _doc.data();
            votos[_doc.id] = data.count;
        });
        renderizarResultados(votos);
    }, (error) => {
        console.error("Error al obtener resultados de Firebase:", error);
        resultadosWrapper.innerHTML = '<p class="mensaje-sin-votos">Error al cargar los resultados.</p>';
    });

    function renderizarResultados(votos) {
        resultadosWrapper.innerHTML = '';

        if (Object.keys(votos).length === 0) {
            resultadosWrapper.innerHTML = '<p class="mensaje-sin-votos">Aún no se han registrado votos.</p>';
            return;
        }

        const votosPorCategoria = {};
        for (const clave in votos) {
            const [categoria, participante] = clave.split('-', 2);
            if (!votosPorCategoria[categoria]) {
                votosPorCategoria[categoria] = {};
            }
            votosPorCategoria[categoria][participante] = votos[clave];
        }

        for (const categoria in votosPorCategoria) {
            const categoriaDiv = document.createElement('div');
            categoriaDiv.className = 'resultado-categoria';
            
            const nombreCategoria = categoria.charAt(0).toUpperCase() + categoria.slice(1);
            categoriaDiv.innerHTML = `<h2>Categoría ${nombreCategoria}</h2>`;

            const participantes = votosPorCategoria[categoria];
            const totalVotosCategoria = Object.values(participantes).reduce((sum, count) => sum + count, 0);

            const participantesOrdenados = Object.entries(participantes).sort(([,a],[,b]) => b - a);

            for (const [participante, numVotos] of participantesOrdenados) {
                const porcentaje = totalVotosCategoria > 0 ? ((numVotos / totalVotosCategoria) * 100).toFixed(1) : 0;

                const itemDiv = document.createElement('div');
                itemDiv.className = 'resultado-item';
                itemDiv.innerHTML = `
                    <div class="info">
                        <span class="participante">${participante}</span>
                        <span class="votos">${numVotos} Voto(s)</span>
                    </div>
                    <div class="barra-progreso">
                        <div class="relleno" style="width: ${porcentaje}%;">${porcentaje}%</div>
                    </div>
                `;
                categoriaDiv.appendChild(itemDiv);
            }
            resultadosWrapper.appendChild(categoriaDiv);
        }
    }
});