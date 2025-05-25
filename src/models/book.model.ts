export interface IBook {
  id?: number;
  titulo: string;
  autor: string;
  anio_publicacion: number;
  genero: string;
  fecha_creacion?: string;
}

export class BookModel {
  // Validar los datos de un libro
  static validate(book: Omit<IBook, 'id' | 'fecha_creacion'>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!book.titulo || book.titulo.trim().length === 0) {
      errors.push('El título es obligatorio');
    }
    
    if (!book.autor || book.autor.trim().length === 0) {
      errors.push('El autor es obligatorio');
    }
    
    if (!book.anio_publicacion || isNaN(book.anio_publicacion)) {
      errors.push('El año de publicación debe ser un número válido');
    } else if (book.anio_publicacion < 0) {
      errors.push('El año de publicación no puede ser negativo');
    }
    
    if (!book.genero || book.genero.trim().length === 0) {
      errors.push('El género es obligatorio');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  // Crear un nuevo libro con valores por defecto
  static createDefault(): IBook {
    return {
      titulo: '',
      autor: '',
      anio_publicacion: new Date().getFullYear(),
      genero: '',
      fecha_creacion: new Date().toISOString()
    };
  }
}