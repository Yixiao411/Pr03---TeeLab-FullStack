# TeeLab - Exclusive Apparel

Tienda online de camisetas exclusivas con estilo moderno y sofisticado.

Video demostrativo: https://drive.google.com/file/d/1obQ5PCWXb6ct7_gEnqD_HadcU0wCUaIc/view?usp=sharing

## Tecnologias

- **Frontend**: HTML5, CSS (Tailwind CSS, Fuentes Google), JavaScript
- **Backend**: Node.js con Express.js
- **Testing**: Jest con Supertest

## Estructura del Proyecto

```
Pr03---TeeLab-FullStack/
├── frontend/               # Interfaz de usuario
│   ├── index.html         # Pagina principal del catalogo
│   ├── cart.html          # Pagina del carrito
│   ├── tiquet.html        # Historial de pedidos
│   ├── tiquetDetail.html  # Detalle de un pedido
│   ├── css/style.css      # Estilos personalizados
│   ├── js/                # Logica frontend
│   │   ├── index.js       # Catalogo y filtros
│   │   ├── cart.js        # Gestion del carrito
│   │   ├── cart-utils.js  # Utilidades del carrito
│   │   └── tiquet.js      # Generacion de tickets
│   └── img/               # Imagenes de productos
├── backend/                # API REST
│   ├── server.js          # Servidor Express
│   ├── controllers/       # Logica de negocio
│   ├── routes/            # Definicion de rutas API
│   ├── services/          # Servicios de datos
│   ├── data/              # Datos JSON (productos y comandas)
│   ├── tests/             # Pruebas unitarias
│   ├── package.json
│   └── jest.config.js
└── README.md
```

## API Endpoints

### Camisetas
| Metodo | Ruta              | Descripcion              |
|--------|-------------------|--------------------------|
| GET    | /camisetas        | Listar todas las camisetas |
| GET    | /camisetas/:id    | Obtener una camiseta     |

### Comandas
| Metodo | Ruta              | Descripcion              |
|--------|-------------------|--------------------------|
| GET    | /comandas         | Listar comandas          |
| GET    | /comandas/:id     | Obtener una comanda      |
| POST   | /comandas         | Crear nueva comanda      |
| DELETE | /comandas/:id     | Eliminar comanda         |

## Instalacion y Uso

```bash
# Backend
cd backend
npm install
npm run dev      # Desarrollo (puerto 3001)
npm start        # Produccion
npm test         # Ejecutar pruebas
```

## Funcionalidades

- Catalogo de camisetas con filtros (buscar, talla, color)
- Ordenamiento por nombre y precio
- Carrito de compras persistente
- Gestion de comandas (pedidos)
- Generacion de tickets de compra
- Historial de pedidos con navegacion por URL
- Pagina de detalle de pedido con parametro ID
