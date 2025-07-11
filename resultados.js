document.addEventListener('DOMContentLoaded', () => {
    // TU CONFIGURACIÓN DE FIREBASE (PEGA AQUÍ EL OBJETO firebaseConfig DEL PASO 1)
    const firebaseConfig = {
        apiKey: "AIzaSyDdRM-0ZAK0-u0RJpSem1xTg8xGiHh3Hv8",
        authDomain: "votacionmetso.firebaseapp.com",
        projectId: "votacionmetso",
        storageBucket: "votacionmetso.firebasestorage.app",
        messagingSenderId: "624381957218",
        appId: "1:624381957218:web:1a594ca0071dd46366ed3b",
        measurementId: "G-TLQ2WKJF8C",
    };

    // Inicializa Firebase
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    const resultadosWrapper = document.getElementById('resultadosWrapper');
    const botonReiniciar = document.getElementById('reiniciarVotos');

    // --- LÓGICA DE ADMINISTRADOR (Modificada para Firebase) ---
    const urlParams = new URLSearchParams(window.location.search);
    const isAdmin = urlParams.get('admin') === 'true';

    if (isAdmin) {
        if (botonReiniciar) {
            botonReiniciar.style.display = 'block';

            botonReiniciar.addEventListener('click', async () => { // Agrega 'async'
                const confirmacion = confirm('¿Estás seguro de que deseas borrar TODOS los votos? Esta acción no se puede deshacer.');

                if (confirmacion) {
                    try {
                        // Borrar todos los documentos de la colección 'votos'
                        const votosSnapshot = await db.collection('votos').get();
                        const batch = db.batch();
                        votosSnapshot.docs.forEach(doc => {
                            batch.delete(doc.ref);
                        });
                        await batch.commit();

                        // Opcional: Reiniciar también el 'hasVoted' de localStorage para quien reinicia
                        localStorage.removeItem('hasVoted');

                        alert('¡Todas las votaciones han sido reiniciadas!');
                        location.href = 'resultados.html'; // Recargar sin el tag de admin
                    } catch (error) {
                        console.error("Error al reiniciar votos:", error);
                        alert('Hubo un error al reiniciar los votos. Inténtalo de nuevo.');
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
            votos[doc.id] = data.count; // El ID del documento es "categoria-participante"
        });

        // Re-renderizar los resultados cada vez que hay un cambio en la base de datos
        renderizarResultados(votos);
    }, (error) => {
        console.error("Error al obtener resultados de Firebase:", error);
        resultadosWrapper.innerHTML = '<p class="mensaje-sin-votos">Error al cargar los resultados.</p>';
    });

    function renderizarResultados(votos) {
        resultadosWrapper.innerHTML = ''; // Limpiar resultados anteriores

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

            // Convertir participantes a un array para poder ordenarlos por votos
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