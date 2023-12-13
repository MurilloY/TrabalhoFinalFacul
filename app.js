const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const uuid = require('uuid');

const app = express();
const port = process.env.PORT || 3000;

app.use(cookieParser());
app.use(
  session({
    secret: 'secretpass',
    resave: true,
    saveUninitialized: true,
  })
);

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

let users = [];
let messages = [];

app.get('/', (req, res) => {
  if (req.session.user) {
    res.render('menu', { user: req.session.user, lastAccess: req.session.lastAccess });
  } else {
    res.redirect('/login');
  }
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Verifica se o usuário e senha correspondem a algum usuário cadastrado
  const authenticatedUser = users.find(user => user.name === username && user.password === password);

  if (authenticatedUser) {
    req.session.user = { id: authenticatedUser.id, name: authenticatedUser.name };
    req.session.lastAccess = new Date().toLocaleString();
    res.redirect('/');
  } else {
    res.send('Credenciais inválidas.');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

app.get('/cadastro', (req, res) => {
  res.render('cadastro');
});

app.post('/cadastro', (req, res) => {
  const { name, email, password } = req.body;

  if (name && email && password) {
    const userId = uuid.v4();
    users.push({ id: userId, name, email, password });
    req.session.user = { id: userId, name };
    req.session.lastAccess = new Date().toLocaleString();
    res.redirect('/');
  } else {
    res.send('Campos inválidos.');
  }
});

app.get('/chat', (req, res) => {
  if (req.session.user) {
    res.render('chat', { user: req.session.user, users, messages });
  } else {
    res.redirect('/login');
  }
});

app.post('/postarMensagem', (req, res) => {
  const { recipient, message } = req.body;

  if (recipient && message) {
    messages.push({
      senderId: req.session.user.id,
      recipient,
      message,
      timestamp: new Date().toLocaleString(),
    });

    res.redirect('/chat');
  } else {
    res.send('Dados inválidos.');
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
