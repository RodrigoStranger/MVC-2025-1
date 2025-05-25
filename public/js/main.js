// Configuración del modal de eliminación
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Verificar si estamos en la página de lista de libros
        const isBooksPage = window.location.pathname === '/books' || 
                           window.location.pathname === '/' || 
                           window.location.pathname === '/books/';
        
        // Si no estamos en la página de libros, salir silenciosamente
        if (!isBooksPage) {
            return;
        }
        
        // Verificar si hay botones de eliminar
        const deleteButtons = document.querySelectorAll('.delete-btn');
        
        // Si no hay botones de eliminar, salir silenciosamente
        if (deleteButtons.length === 0) {
            return;
        }
        
        // Obtener referencias solo si hay botones
        const deleteModal = document.getElementById('deleteModal');
        const deleteForm = document.getElementById('deleteForm');
        
        // Verificar que el modal y el formulario existen
        if (!deleteModal || !deleteForm) {
            return; // Salir silenciosamente si no existen
        }
        
        // Inicializar el modal de Bootstrap
        const modal = new bootstrap.Modal(deleteModal);
        
        // Configurar los manejadores de eventos para los botones de eliminar
        deleteButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const bookId = this.getAttribute('data-book-id');
                const bookTitle = this.getAttribute('data-book-title');
                
                // Actualizar el mensaje del modal
                const bookTitleElement = document.getElementById('bookTitle');
                if (bookTitleElement && bookTitle) {
                    bookTitleElement.textContent = bookTitle;
                }
                
                // Configurar la acción del formulario y mostrar el modal
                if (bookId) {
                    deleteForm.action = `/api/books/eliminar/${bookId}`;
                    modal.show();
                }
            });
        });
        
        // Manejar el envío del formulario
        deleteForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            fetch(this.action, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then((response) => {
                if (response.redirected) {
                    window.location.href = response.url;
                } else {
                    window.location.reload();
                }
            })
            .catch((error) => {
                console.error('Error al eliminar el libro:', error);
                alert('Error al eliminar el libro. Por favor, inténtalo de nuevo.');
            });
        });
    } catch (error) {
        // Silenciar cualquier error
        console.error(error);
    }
});