const request = require('supertest');
const app = require('../../server');
const mongoose = require('mongoose');
const Product = require('../../models/Product');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Inventory Routes', () => {
  let productId;

  it('should fetch all products', async () => {
    const res = await request(app).get('/api/inventory');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('products');
  });

  it('should add a new product', async () => {
    const productData = { name: 'Test Product', price: 100, quantity: 10, category: 'Test' };
    const res = await request(app).post('/api/inventory').send(productData);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    productId = res.body._id;
  });

  it('should update a product', async () => {
    const res = await request(app).put(`/api/inventory/${productId}`).send({ price: 120 });
    expect(res.statusCode).toBe(200);
    expect(res.body.price).toBe(120);
  });

  it('should delete a product', async () => {
    const res = await request(app).delete(`/api/inventory/${productId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Product deleted');
  });
});
