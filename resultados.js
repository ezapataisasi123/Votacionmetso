document.addEventListener('DOMContentLoaded', () => {
    const resultadosWrapper = document.getElementById('resultadosWrapper');
    const votos = JSON.parse(localStorage.getItem('voteCounts')) || {};

    // --- LÓGICA DE ADMINISTRADOR ---
    // 1. Revisar si la URL contiene la "llave secreta"
    const urlParams = new URLSearchParams(window.location.search);
    const isAdmin = urlParams.get('admin') === 'true';

    // 2. Si es admin, mostrar y activar el botón de reinicio
    if (isAdmin) {
        const botonReiniciar = document.getElementById('reiniciarVotos');
        if (botonReiniciar) {
            botonReiniciar.style.display = 'block'; // Hacemos visible el botón

            botonReiniciar.addEventListener('click', () => {
                const confirmacion = confirm('¿Estás seguro de que deseas borrar TODOS los votos? Esta acción no se puede deshacer.');

                if (confirmacion) {
                    localStorage.removeItem('voteCounts');
                    localStorage.removeItem('hasVoted');
                    alert('¡Todas las votaciones han sido reiniciadas!');
                    location.href = 'resultados.html'; // Recargamos la página sin el tag de admin
                }
            });
        }
    }
    // --- FIN DE LÓGICA DE ADMINISTRADOR ---


    // --- LÓGICA PARA MOSTRAR RESULTADOS (SIN CAMBIOS) ---
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

        for (const participante in participantes) {
            const numVotos = participantes[participante];
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
});
