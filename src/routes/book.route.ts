import { Router } from 'express';
import { BookController } from '../controllers/book.controller.js';

// Tipo para los controladores de express
type RequestHandler = (req: any, res: any, next: any) => any;

// ====================================
// Rutas de la API (JSON)
// ====================================
const apiRouter = Router();

// Obtener todos los libros (API)
apiRouter.get('/', BookController.getBooks as RequestHandler);

// Obtener un libro por ID (API)
apiRouter.get('/:id', BookController.getBookById as RequestHandler);

// Crear un nuevo libro (API)
apiRouter.post('/', BookController.createBook as RequestHandler);

// Actualizar un libro existente (API)
apiRouter.put('/:id', BookController.updateBook as RequestHandler);

// Eliminar un libro (API)
apiRouter.delete('/eliminar/:id', BookController.deleteBook as RequestHandler);

// ====================================
// Rutas de la Web (Vistas)
// ====================================
const webRouter = Router();

// Lista de libros
webRouter.get('/', BookController.getBooks as RequestHandler);

// Mostrar formulario de creación
webRouter.get('/new', BookController.showCreateForm as RequestHandler);

// Mostrar un libro
webRouter.get('/:id', BookController.getBookById as RequestHandler);

// Mostrar formulario de edición
webRouter.get('/:id/edit', BookController.showEditForm as RequestHandler);

// Crear un nuevo libro (POST desde formulario)
webRouter.post('/', BookController.createBook as RequestHandler);

// Actualizar un libro (PUT desde formulario)
webRouter.post('/:id', BookController.updateBook as RequestHandler);

// Eliminar un libro (DELETE desde formulario)
webRouter.post('/:id/delete', BookController.deleteBook as RequestHandler);

// Exportar los routers para ser montados en el servidor
export { apiRouter, webRouter };