import express, { Application, Request, Response, NextFunction } from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import session from 'express-session';
import flash from 'connect-flash';
import { apiRouter as bookApiRouter, webRouter as bookWebRouter } from './src/routes/book.route.js';
import { initDb } from './src/config/db.js';
import { hbs } from './src/utils/hbs-helpers.js';

declare module 'express-session' {
  interface SessionData {
    messages: { [key: string]: any };
  }
}

// Configuración de rutas para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
config();

// Crear aplicación Express
const app: Application = express();
const PORT = process.env.PORT || 3000;

// Configuración de Handlebars
app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');
app.set('views', [
  path.join(process.cwd(), 'views'),
  path.join(process.cwd(), 'views/books')
]);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Configuración de archivos estáticos
const publicPath = path.join(process.cwd(), 'public');
console.log('Serving static files from:', publicPath);

// Servir archivos estáticos
app.use(express.static(publicPath, {
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// Rutas adicionales para asegurar que los archivos se encuentren
app.use('/css', express.static(path.join(publicPath, 'css'), { 
  setHeaders: (res) => {
    res.setHeader('Content-Type', 'text/css');
  }
}));

app.use('/js', express.static(path.join(publicPath, 'js'), {
  setHeaders: (res) => {
    res.setHeader('Content-Type', 'application/javascript');
  }
}));

// Configuración de sesión
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'secreto-seguro',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 // 1 día
  }
};

app.use(session(sessionConfig));

// Middleware de mensajes flash
app.use(flash() as any);

// Middleware para hacer los mensajes flash disponibles en las vistas
app.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.success_msg = (req as any).flash('success_msg');
  res.locals.error_msg = (req as any).flash('error_msg');
  res.locals.errors = (req as any).flash('errors');
  next();
});

// Rutas API
app.use('/api/books', bookApiRouter);

// Rutas Web
app.use('/books', bookWebRouter);

// Manejador de errores
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal!' });
});

// Inicializar la base de datos y luego iniciar el servidor
async function startServer() {
  try {
    await initDb();
    console.log('Base de datos inicializada correctamente');
    
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}/books`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();