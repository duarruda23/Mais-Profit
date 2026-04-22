import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import * as xlsx from 'xlsx';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper for Nibo OAuth (assuming standard OAuth2 flow)
const NIBO_AUTH_URL = 'https://api.nibo.com.br/v1/auth/authorize';
const NIBO_TOKEN_URL = 'https://api.nibo.com.br/v1/auth/token';

async function startServer() {
  const app = express();
  const PORT = 3000;
  const upload = multer({ storage: multer.memoryStorage() });

  app.use(express.json({ limit: '50mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Excel Upload Handler
  app.post('/api/upload-excel', upload.single('file'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
      }

      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);

      // Simple validation of required columns
      const requiredColumns = ['type', 'amount', 'dueDate', 'status'];
      const firstRow = data[0] as any;
      if (data.length > 0) {
        const missing = requiredColumns.filter(col => !(col in firstRow));
        if (missing.length > 0) {
          return res.status(400).json({ error: `Colunas ausentes: ${missing.join(', ')}` });
        }
      }

      res.json({ data, count: data.length });
    } catch (error) {
      console.error('Excel processing error:', error);
      res.status(500).json({ error: 'Erro ao processar a planilha.' });
    }
  });

  // Mock API Sync for Omie / Conta Azul
  app.post('/api/sync/:provider', (req, res) => {
    const { provider } = req.params;
    const { clientId, credentials } = req.body;

    console.log(`Syncing ${provider} for client ${clientId}`);

    // In a real app, we would use axios to call the provider APIs here
    // For now, we simulate a successful sync
    setTimeout(() => {
      res.json({
        status: 'success',
        message: `Dados sincronizados com sucesso via ${provider}.`,
        timestamp: new Date().toISOString()
      });
    }, 1500);
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Profit BPO Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
