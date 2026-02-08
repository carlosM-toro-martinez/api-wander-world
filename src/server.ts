import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { config } from './config/config';
import router from './routes';
import path from 'path';

const app = express();
const server = createServer(app);
const io = new Server(server);
const port = config.port;

app.set('trust proxy', true);

app.use('/', express.static(path.join(__dirname, '../public')));
app.use(cors({ credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
router(app);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use((req, res, next) => {
  if (req.hostname === 'api.potosymasquehistoria.com') {
    res.send('¡Hola desde el subdominio api.potosymasquehistoria.com!');
  } else {
    next();
  }
});

server.listen(port, () => {
  console.log(process.env.PORT);
  console.log(`mi port ${port}`);
});

export default io;
