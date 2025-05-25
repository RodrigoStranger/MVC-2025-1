# Gestión de Libros

## 🏃 Ejecución

Instalar dependencias:
```bash
npm install
# o
yarn install
```

Iniciar el servidor:
```bash
npm run dev
# o
yarn dev
```

El servidor estará disponible en: http://localhost:3000

## 🛠️ Estructura del Proyecto

```
src/
├── config/         # Configuraciones
├── controllers/    # Controladores
├── models/         # Modelos de datos
├── routes/         # Rutas de la API
└── server.ts       # Punto de entrada
```

## 📚 Documentación de la API

### Base URL
```bash
http://localhost:3000/api/books
```

### Endpoints

#### 1. Obtener todos los libros
- **Método:** `GET`
- **URL:** `/`
- **Respuesta Exitosa (200):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "titulo": "Cien años de soledad",
        "autor": "Gabriel García Márquez",
        "anio_publicacion": 1967,
        "genero": "Realismo mágico",
        "fecha_creacion": "2025-05-24T23:00:00.000Z"
      }
    ]
  }
  ```

#### 2. Obtener un libro por ID
- **Método:** `GET`
- **URL:** `/:id`
- **Parámetros de URL:**
  - `id` (requerido): ID del libro
- **Respuesta Exitosa (200):**
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "titulo": "Cien años de soledad",
      "autor": "Gabriel García Márquez",
      "anio_publicacion": 1967,
      "genero": "Realismo mágico",
      "fecha_creacion": "2025-05-24T23:00:00.000Z"
    }
  }
  ```
- **Error (404):**
  ```json
  {
    "success": false,
    "message": "Libro no encontrado",
    "error": "Libro no encontrado"
  }
  ```

#### 3. Crear un nuevo libro
- **Método:** `POST`
- **URL:** `/`
- **Cuerpo (JSON):**
  ```json
  {
    "titulo": "1984",
    "autor": "George Orwell",
    "anio_publicacion": 1949,
    "genero": "Ciencia ficción"
  }
  ```
- **Respuesta Exitosa (201):**
  ```json
  {
    "success": true,
    "message": "Libro creado exitosamente",
    "data": {
      "id": 2,
      "titulo": "1984",
      "autor": "George Orwell",
      "anio_publicacion": 1949,
      "genero": "Ciencia ficción",
      "fecha_creacion": "2025-05-24T23:00:00.000Z"
    }
  }
  ```
- **Error (409) - Título duplicado:**
  ```json
  {
    "success": false,
    "message": "Error al crear: Ya existe un libro con ese título",
    "error": "Título duplicado"
  }
  ```

#### 4. Actualizar un libro existente
- **Método:** `PUT`
- **URL:** `/:id`
- **Parámetros de URL:**
  - `id` (requerido): ID del libro a actualizar
- **Cuerpo (JSON):**
  ```json
  {
    "titulo": "1984 (Edición Especial)",
    "autor": "George Orwell",
    "anio_publicacion": 1949,
    "genero": "Distopía"
  }
  ```
- **Respuesta Exitosa (200):**
  ```json
  {
    "success": true,
    "message": "Libro actualizado exitosamente",
    "data": {
      "id": 2,
      "titulo": "1984 (Edición Especial)",
      "autor": "George Orwell",
      "anio_publicacion": 1949,
      "genero": "Distopía",
      "fecha_creacion": "2025-05-24T23:00:00.000Z"
    }
  }
  ```

#### 5. Eliminar un libro
- **Método:** `DELETE`
- **URL:** `/:id`
- **Parámetros de URL:**
  - `id` (requerido): ID del libro a eliminar
- **Respuesta Exitosa (200):**
  ```json
  {
    "success": true,
    "message": "Libro eliminado exitosamente",
    "deletedBook": {
      "id": 2,
      "titulo": "1984 (Edición Especial)",
      "autor": "George Orwell",
      "anio_publicacion": 1949,
      "genero": "Distopía",
      "fecha_creacion": "2025-05-24T23:00:00.000Z"
    }
  }
  ```