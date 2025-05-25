import Database from 'better-sqlite3';
import path from 'path';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Configuración de la base de datos
const DB_PATH = process.env.DB_PATH || path.resolve(process.cwd(), 'database.sqlite');

// Crear una instancia de la base de datos
const db = new Database(DB_PATH);

// Habilitar foreign keys
db.pragma('foreign_keys = ON');

// Inicializar la base de datos (crear tablas si no existen)
export const initDb = (): void => {
  try {
    // Crear tabla de libros si no existe
    db.prepare(`
      CREATE TABLE IF NOT EXISTS libros (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        autor TEXT NOT NULL,
        anio_publicacion INTEGER NOT NULL,
        genero TEXT NOT NULL,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
    
    // Insertar datos de ejemplo si la tabla está vacía
    const result = db.prepare('SELECT COUNT(*) as count FROM libros').get() as { count: number };
    const count = result.count;
    
    if (count === 0) {
      const insert = db.prepare(
        'INSERT INTO libros (titulo, autor, anio_publicacion, genero) VALUES (?, ?, ?, ?)'
      );
      
      const librosIniciales = [
        ['Cien años de soledad', 'Gabriel García Márquez', 1967, 'Realismo mágico'],
        ['El señor de los anillos', 'J.R.R. Tolkien', 1954, 'Fantasía'],
        ['1984', 'George Orwell', 1949, 'Ciencia ficción'],
        ['Orgullo y prejuicio', 'Jane Austen', 1813, 'Romance'],
        ['El principito', 'Antoine de Saint-Exupéry', 1943, 'Fábula']
      ];
      
      const insertMany = db.transaction((libros) => {
        for (const libro of libros) insert.run(...libro);
      });
      
      insertMany(librosIniciales);
      console.log('Datos de ejemplo insertados correctamente');
    }
    
    console.log('Base de datos SQLite inicializada correctamente');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    throw error;
  }
};

// Obtener la instancia de la base de datos
export const getDb = () => {
  return db;
};

export default {
  getDb,
  initDb
};