import { Request, Response } from 'express';
import { getDb } from '../config/db.js';
import { IBook, BookModel } from '../models/book.model.js';

export class BookController {
  // Vista: Lista de libros
  static async getBooks(req: Request, res: Response) {
    try {
      const db = getDb();
      const stmt = db.prepare('SELECT * FROM libros ORDER BY id DESC');
      const libros = stmt.all() as IBook[];
      
      // Si es una petición API, devolver JSON
      if (req.path.startsWith('/api/')) {
        return res.json(libros);
      }
      
      // Si no, renderizar la vista
      res.render('books/list', {
        title: 'Lista de Libros',
        books: libros
      });
    } catch (error) {
      console.error(error);
      
      if (req.path.startsWith('/api/')) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return res.status(500).json({ 
          success: false,
          message: 'Error al obtener los libros',
          error: errorMessage
        });
      }
      
      res.status(500).render('error', {
        title: 'Error',
        message: 'Error al cargar la lista de libros'
      });
    }
  }

  // Vista: Mostrar un libro
  static async getBookById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const db = getDb();
      const stmt = db.prepare('SELECT * FROM libros WHERE id = ?');
      const libro = stmt.get(Number(id)) as IBook | undefined;

      if (!libro) {
        if (req.path.startsWith('/api/')) {
          return res.status(404).json({ error: 'Libro no encontrado' });
        }
        return res.status(404).render('error', {
          title: 'Error',
          message: 'Libro no encontrado'
        });
      }

      if (req.path.startsWith('/api/')) {
        return res.json(libro);
      }

      res.render('books/show', {
        title: libro.titulo,
        libro
      });
    } catch (error) {
      console.error(error);
      
      if (req.path.startsWith('/api/')) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return res.status(500).json({ 
          success: false,
          message: 'Error al obtener el libro',
          error: errorMessage
        });
      }
      
      res.status(500).render('error', {
        title: 'Error',
        message: 'Error al cargar el libro'
      });
    }
  }
  
  // Vista: Mostrar formulario de creación
  static showCreateForm(_req: Request, res: Response) {
    res.render('books/form', {
      title: 'Nuevo Libro',
      libro: {}
    });
  }
  
  // Vista: Mostrar formulario de edición
  static async showEditForm(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const db = getDb();
      const stmt = db.prepare('SELECT * FROM libros WHERE id = ?');
      const libro = stmt.get(Number(id)) as IBook | undefined;

      if (!libro) {
        return res.status(404).render('error', {
          title: 'Error',
          message: 'Libro no encontrado'
        });
      }

      res.render('books/form', {
        title: 'Editar Libro',
        libro,
        currentYear: new Date().getFullYear()
      });
    } catch (error) {
      console.error(error);
      res.status(500).render('error', {
        title: 'Error',
        message: 'Error al cargar el formulario de edición'
      });
    }
  }

  static async createBook(req: Request, res: Response) {
    try {
      const { titulo, autor, anio_publicacion, genero } = req.body;
      
      // Validar que todos los campos requeridos estén presentes
      if (!titulo || !autor || !anio_publicacion || !genero) {
        const errorMsg = 'Todos los campos son requeridos';
        
        if (req.path.startsWith('/api/')) {
          return res.status(400).json({ 
            success: false, 
            message: errorMsg 
          });
        }
        
        (req as any).flash('error_msg', errorMsg);
        return res.redirect('/books/new');
      }
      
      // Validar que el año sea un número válido
      const anio = parseInt(anio_publicacion, 10);
      if (isNaN(anio) || anio < 1000 || anio > new Date().getFullYear()) {
        const errorMsg = 'El año de publicación debe ser un número válido entre 1000 y el año actual';
        
        if (req.path.startsWith('/api/')) {
          return res.status(400).json({ 
            success: false, 
            message: errorMsg
          });
        }
        
        (req as any).flash('error_msg', errorMsg);
        return res.redirect('/books/new');
      }
      
      // Verificar si ya existe un libro con el mismo título
      const db = getDb();
      const stmtCheck = db.prepare('SELECT id FROM libros WHERE titulo = ?');
      const existingBook = stmtCheck.get(titulo);
      
      if (existingBook) {
        const errorMsg = 'Ya existe un libro con ese título';
        
        if (req.path.startsWith('/api/')) {
          return res.status(400).json({ 
            success: false, 
            message: errorMsg
          });
        }
        
        (req as any).flash('error_msg', errorMsg);
        return res.redirect('/books/new');
      }
      
      // Insertar el nuevo libro
      const stmt = db.prepare(
        'INSERT INTO libros (titulo, autor, anio_publicacion, genero) VALUES (?, ?, ?, ?)'
      );
      
      const result = stmt.run(titulo, autor, anio, genero);
      
      if (result.changes === 0) {
        throw new Error('No se pudo crear el libro');
      }
      
      // Obtener el libro recién creado
      const stmtGet = db.prepare('SELECT * FROM libros WHERE id = ?');
      const nuevoLibro = stmtGet.get(result.lastInsertRowid) as IBook;
      
      if (req.path.startsWith('/api/')) {
        return res.status(201).json({
          success: true,
          data: nuevoLibro,
          message: 'Libro creado exitosamente'
        });
      }
      
      (req as any).flash('success_msg', 'Libro creado exitosamente');
      res.redirect(`/books/${nuevoLibro.id}`);
      
    } catch (error: unknown) {
      console.error(error);
      const errorMsg = 'Error al crear el libro';
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      if (req.path.startsWith('/api/')) {
        return res.status(500).json({ 
          success: false, 
          message: errorMsg,
          error: errorMessage
        });
      }
      
      (req as any).flash('error_msg', errorMsg);
      res.redirect('/books/new');
    }
  }

  static async updateBook(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { titulo, autor, anio_publicacion, genero } = req.body;
      const db = getDb();
      
      // Verificar si el libro existe
      const existingBook = db.prepare('SELECT * FROM libros WHERE id = ?')
        .get(Number(id)) as IBook | undefined;
      
      if (!existingBook) {
        const errorMsg = 'Libro no encontrado';
        
        if (req.path.startsWith('/api/')) {
          return res.status(404).json({ 
            success: false,
            message: errorMsg 
          });
        }
        
        (req as any).flash('error_msg', errorMsg);
        return res.redirect('/books');
      }
      
      // Validar que todos los campos requeridos estén presentes
      if (!titulo || !autor || !anio_publicacion || !genero) {
        const errorMsg = 'Todos los campos son requeridos';
        
        if (req.path.startsWith('/api/')) {
          return res.status(400).json({ 
            success: false, 
            message: errorMsg 
          });
        }
        
        (req as any).flash('error_msg', errorMsg);
        return res.redirect(`/books/${id}/edit`);
      }
      
      // Validar que el año sea un número válido
      const anio = typeof anio_publicacion === 'string' 
        ? parseInt(anio_publicacion, 10) 
        : anio_publicacion;
        
      if (isNaN(anio) || anio < 1000 || anio > new Date().getFullYear()) {
        const errorMsg = 'El año de publicación debe ser un número válido entre 1000 y el año actual';
        
        if (req.path.startsWith('/api/')) {
          return res.status(400).json({ 
            success: false, 
            message: errorMsg 
          });
        }
        
        (req as any).flash('error_msg', errorMsg);
        return res.redirect(`/books/${id}/edit`);
      }
      
      // Si se está actualizando el título, verificar que no exista otro con el mismo título
      if (titulo !== existingBook.titulo) {
        const duplicateBook = db.prepare('SELECT id FROM libros WHERE LOWER(titulo) = LOWER(?) AND id != ?')
          .get(titulo, id) as { id: number } | undefined;
        
        if (duplicateBook) {
          const errorMsg = 'Ya existe otro libro con ese título';
          
          if (req.path.startsWith('/api/')) {
            return res.status(409).json({ 
              success: false,
              message: errorMsg,
              existingBookId: duplicateBook.id
            });
          }
          
          (req as any).flash('error_msg', errorMsg);
          return res.redirect(`/books/${id}/edit`);
        }
      }
      
      // Actualizar el libro
      const stmt = db.prepare(`
        UPDATE libros 
        SET titulo = ?, autor = ?, anio_publicacion = ?, genero = ?
        WHERE id = ?
      `);
      
      const result = stmt.run(titulo, autor, anio, genero, Number(id));
      
      if (result.changes === 0) {
        const errorMsg = 'No se realizaron cambios en el libro';
        
        if (req.path.startsWith('/api/')) {
          return res.status(400).json({ 
            success: false,
            message: errorMsg 
          });
        }
        
        (req as any).flash('info_msg', errorMsg);
        return res.redirect(`/books/${id}`);
      }
      
      const updatedBook = db.prepare('SELECT * FROM libros WHERE id = ?')
        .get(Number(id)) as IBook;
      
      if (req.path.startsWith('/api/')) {
        return res.json({
          success: true,
          data: updatedBook,
          message: 'Libro actualizado exitosamente'
        });
      }
      
      (req as any).flash('success_msg', 'Libro actualizado exitosamente');
      res.redirect(`/books/${id}`);
      
    } catch (error: unknown) {
      console.error(error);
      const errorMsg = 'Error al actualizar el libro';
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      if (req.path.startsWith('/api/')) {
        return res.status(500).json({ 
          success: false, 
          message: errorMsg,
          error: errorMessage
        });
      }
      
      (req as any).flash('error_msg', errorMsg);
      res.redirect(`/books/${req.params.id}/edit`);
    }
  }

  static async deleteBook(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const db = getDb();
      
      // Verificar si el libro existe
      const book = db.prepare('SELECT * FROM libros WHERE id = ?')
        .get(Number(id)) as IBook | undefined;
      
      if (!book) {
        const errorMsg = 'Libro no encontrado';
        
        if (req.path.startsWith('/api/')) {
          return res.status(404).json({ 
            success: false,
            message: errorMsg
          });
        }
        
        (req as any).flash('error_msg', errorMsg);
        return res.redirect('/books');
      }
      
      const stmt = db.prepare('DELETE FROM libros WHERE id = ?');
      const result = stmt.run(Number(id));
      
      if (result.changes === 0) {
        const errorMsg = 'No se pudo eliminar el libro';
        
        if (req.path.startsWith('/api/')) {
          return res.status(400).json({ 
            success: false,
            message: errorMsg
          });
        }
        
        (req as any).flash('error_msg', errorMsg);
        return res.redirect(`/books/${id}`);
      }
      
      if (req.path.startsWith('/api/')) {
        return res.json({
          success: true,
          message: 'Libro eliminado exitosamente',
          deletedBook: book
        });
      }
      
      (req as any).flash('success_msg', 'Libro eliminado exitosamente');
      res.redirect('/books');
      
    } catch (error: unknown) {
      console.error('Error al eliminar el libro:', error);
      const errorMsg = 'Error al eliminar el libro';
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      if (req.path.startsWith('/api/')) {
        return res.status(500).json({ 
          success: false,
          message: errorMsg,
          error: errorMessage
        });
      }
      
      (req as any).flash('error_msg', errorMsg);
      res.redirect(`/books/${req.params.id}`);
    }
  }
}