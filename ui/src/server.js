import express from 'express';
import history from 'connect-history-api-fallback';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const express = require('express');
const history = require('connect-history-api-fallback');
const path = require('path');

const app = express();

// Use history API fallback
app.use(history({
  disableDotRule: true,
  rewrites: [
    {
      from: /^\/.*$/,
      to: '/index.html'
    }
  ]
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// All routes should serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
