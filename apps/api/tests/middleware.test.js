const errorHandler = require('../src/middleware/error.middleware');

// Mock res object
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Error Middleware', () => {
  it('handles generic errors with 500 status', () => {
    const err = new Error('Something went wrong');
    const res = mockRes();
    errorHandler(err, {}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('handles errors with custom statusCode', () => {
    const err = Object.assign(new Error('Not found'), { statusCode: 404 });
    const res = mockRes();
    errorHandler(err, {}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('handles Mongoose duplicate key error (code 11000)', () => {
    const err = { code: 11000, keyValue: { email: 'test@test.com' } };
    const res = mockRes();
    errorHandler(err, {}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('Email') })
    );
  });

  it('handles CastError for invalid ObjectId', () => {
    const err = { name: 'CastError', path: 'id', value: 'invalid-id' };
    const res = mockRes();
    errorHandler(err, {}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
