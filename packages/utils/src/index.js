// Shared validation helpers (framework-agnostic, usable in both api and web)
const { z } = require('zod');

const emailSchema = z.string().email();
const passwordSchema = z.string().min(6);

const isValidEmail = (email) => emailSchema.safeParse(email).success;
const isValidPassword = (pw) => passwordSchema.safeParse(pw).success;

const paginate = (page = 1, limit = 10) => ({
  skip: (Math.max(1, page) - 1) * Math.max(1, limit),
  limit: Math.max(1, Math.min(100, limit)),
});

const pick = (obj, keys) => keys.reduce((acc, k) => { if (k in obj) acc[k] = obj[k]; return acc; }, {});

const omit = (obj, keys) => Object.fromEntries(Object.entries(obj).filter(([k]) => !keys.includes(k)));

module.exports = { isValidEmail, isValidPassword, paginate, pick, omit };
