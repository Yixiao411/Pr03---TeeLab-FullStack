import request from 'supertest';
import express from 'express';
import cors from 'cors';
import camisetasRouter from '../routes/camisetas.routes.js';
import comandasRouter from '../routes/comandas.routes.js';

const app = express();

app.use(express.json());
app.use(cors());

app.use('/camisetas', camisetasRouter);
app.use('/comandas', comandasRouter);

app.use((err, req, res, next) => {
    console.error(err.message);
    res.status(500).json({ message: "Error interno" });
});

describe('Comandas', () => {
    describe('POST /comandas', () => {
        test('Crea comanda correctamente', async () => {
            const comanda = {
                cliente: {
                    nombre: 'Juan García',
                    email: 'juan@gmail.com'
                },
                direccion: 'Calle Principal 123',
                items: [
                    {
                        camisetaId: 'TSH01',
                        talla: 'M',
                        color: 'negro',
                        cantidad: 2
                    }
                ]
            };

            const response = await request(app)
                .post('/comandas')
                .send(comanda)
                .expect(201);

            expect(response.body).toHaveProperty('message', 'Created');
            expect(response.body).toHaveProperty('tiquet');
            expect(response.body.tiquet).toHaveProperty('id');
            expect(response.body.tiquet).toHaveProperty('total');
            expect(response.body.tiquet.items).toHaveLength(1);
        });

        test('Retornar 400 inválido', async () => {
            const comanda = {
                cliente: {
                    nombre: 'María López',
                    email: 'maria@gmail.com'
                },
                direccion: 'Avenida Central 456',
                items: [
                    {
                        camisetaId: 'INVALID_ID',
                        talla: 'L',
                        color: 'blanco',
                        cantidad: 1
                    }
                ]
            };

            const response = await request(app)
                .post('/comandas')
                .send(comanda)
                .expect(400);

            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toContain('no existe');
        });

        test('Retornar 400 cuando falta el nombre', async () => {
            const comanda = {
                cliente: {
                    email: 'test@gmail.com'
                },
                direccion: 'Calle Test 789',
                items: [
                    {
                        camisetaId: 'TSH01',
                        talla: 'M',
                        color: 'negro',
                        cantidad: 1
                    }
                ]
            };

            const response = await request(app)
                .post('/comandas')
                .send(comanda)
                .expect(400);

            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toContain('nombre');
        });

        test('Retornar 400 cuando falta el email del cliente', async () => {
            const comanda = {
                cliente: {
                    nombre: 'Test User'
                },
                direccion: 'Calle Test 789',
                items: [
                    {
                        camisetaId: 'TSH01',
                        talla: 'M',
                        color: 'negro',
                        cantidad: 1
                    }
                ]
            };

            const response = await request(app)
                .post('/comandas')
                .send(comanda)
                .expect(400);

            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toContain('email');
        });

        test('Retornar 400 cuando items está vacío', async () => {
            const comanda = {
                cliente: {
                    nombre: 'Test User',
                    email: 'test@gmail.com'
                },
                direccion: 'Calle Test 789',
                items: []
            };

            const response = await request(app)
                .post('/comandas')
                .send(comanda)
                .expect(400);

            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toContain('al menos 1 item');
        });
    });

    
    describe('GET /comandas/:id', () => {
        test('Retornar 404 cuando comanda no existe', async () => {
            const response = await request(app)
                .get('/comandas/INEXISTENTE')
                .expect(404);

            expect(response.body).toHaveProperty('message', 'Not Found');
        });

        test('Retornar la comanda cuando existe', async () => {
            // Primero crear una comanda
            const comandaData = {
                cliente: {
                    nombre: 'Test User',
                    email: 'test@gmail.com'
                },
                direccion: 'Calle Test',
                items: [
                    {
                        camisetaId: 'TSH01',
                        talla: 'M',
                        color: 'negro',
                        cantidad: 1
                    }
                ]
            };

            const createResponse = await request(app)
                .post('/comandas')
                .send(comandaData)
                .expect(201);

            const comandaId = createResponse.body.tiquet.id;

            // Luego obtenerla
            const getResponse = await request(app)
                .get(`/comandas/${comandaId}`)
                .expect(200);

            expect(getResponse.body).toHaveProperty('id', comandaId);
            expect(getResponse.body).toHaveProperty('cliente');
            expect(getResponse.body).toHaveProperty('items');
        });
    });

    describe('GET /comandas', () => {
        test('Retornar array vacío inicialmente', async () => {
            const response = await request(app)
                .get('/comandas')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });

        test('Retornar todas las comandas creadas', async () => {
            // Crear dos comandas
            const comanda1 = {
                cliente: {
                    nombre: 'User 1',
                    email: 'user1@gmail.com'
                },
                direccion: 'Dirección 1',
                items: [
                    {
                        camisetaId: 'TSH01',
                        talla: 'M',
                        color: 'negro',
                        cantidad: 1
                    }
                ]
            };

            const comanda2 = {
                cliente: {
                    nombre: 'User 2',
                    email: 'user2@gmail.com'
                },
                direccion: 'Dirección 2',
                items: [
                    {
                        camisetaId: 'TSH02',
                        talla: 'L',
                        color: 'gris',
                        cantidad: 2
                    }
                ]
            };

            await request(app).post('/comandas').send(comanda1);
            await request(app).post('/comandas').send(comanda2);

            const response = await request(app)
                .get('/comandas')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThanOrEqual(2);
        });
    });
});
