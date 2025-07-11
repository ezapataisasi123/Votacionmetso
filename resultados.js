// resultados.js
document.addEventListener('DOMContentLoaded', () => {
    // Ya no necesitas firebaseConfig ni inicializar Firebase aquí
    // Las variables 'app' y 'db' vienen de window
    const app = window.firebaseApp;
    const db = window.firebaseDb; 

    // Asegúrate de que 'db' esté disponible antes de usarlo
    if (!db) {
        console.error("Firebase Firestore no está inicializado. Asegúrate de que los scripts de Firebase se carguen primero en HTML.");
        return; // Detener la ejecución si Firebase no está listo
    }

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
                        const votosSnapshot = await db.collection('votos').get();
                        const batch = db.batch();
                        votosSnapshot.docs.forEach(doc => {
                            batch.delete(doc.ref);
                        });
                        await batch.commit();

                        localStorage.removeItem('hasVoted');

                        alert('¡Todas las votaciones han sido reiniciadas!');
                        location.href = 'resultados.html';
                    } catch (error) {
                        console.error("Error al reiniciar votos:", error);
                        alert('Hubo un error al reiniciar los votos. Inténtalo de nuevo. Revisa la consola para más detalles.');
                    }
                }
            });
        }
    }

    // --- LÓGICA PARA MOSTRAR RESULTADOS (Con listener en tiempo real de Firebase) ---
    db.collection('votos').onSnapshot((snapshot) => {
        const votos = {};
        snapshot.forEach(doc => {
            const data = doc.data();
            votos[doc.id] = data.count;
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