document.addEventListener('DOMContentLoaded', () => {

    const votingForm = document.getElementById('votingForm');
    const mensajeVotado = document.getElementById('mensajeVotado');

    // 1. Revisar si el usuario ya votó al cargar la página
    if (localStorage.getItem('hasVoted') === 'true') {
        mostrarMensajeVotado();
    }

    // 2. Lógica para permitir solo un checkbox por categoría
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

    // 3. Manejar el envío del voto
    votingForm.addEventListener('submit', (event) => {
        event.preventDefault();

        // Obtener los votos actuales de localStorage o crear un objeto vacío
        const votos = JSON.parse(localStorage.getItem('voteCounts')) || {};

        // Recorrer los checkboxes seleccionados
        const seleccionados = document.querySelectorAll('input[type="checkbox"]:checked');
        
        if (seleccionados.length === 0) {
            alert('Por favor, selecciona al menos una opción para votar.');
            return;
        }

        seleccionados.forEach(seleccion => {
            const categoria = seleccion.name;
            const participante = seleccion.value;
            const clave = `${categoria}-${participante}`; // Clave única: "individual-Participante 1"

            // Incrementar el contador para esa clave
            votos[clave] = (votos[clave] || 0) + 1;
        });

        // Guardar los nuevos conteos en localStorage
        localStorage.setItem('voteCounts', JSON.stringify(votos));

        // Marcar que el usuario ya votó
        localStorage.setItem('hasVoted', 'true');
        
        mostrarMensajeVotado();
        alert('¡Voto enviado con éxito! Gracias por participar.');
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