const request = require('supertest');
const app = require('../../server');
const mongoose = require('mongoose');
const Transaction = require('../../models/Transaction');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Transactions Integration', () => {
  let transactionId;

  it('should create a new transaction', async () => {
    const transactionData = { type: 'income', amount: 500, description: 'Test Income', category: 'Test' };
    const res = await request(app).post('/api/transactions').send(transactionData);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    transactionId = res.body._id;
  });

  it('should fetch all transactions', async () => {
    const res = await request(app).get('/api/transactions');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(expect.arrayContaining([expect.objectContaining({ _id: transactionId })]));
  });

  it('should delete a transaction', async () => {
    const res = await request(app).delete(`/api/transactions/${transactionId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Transaction deleted');
  });
});
