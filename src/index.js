const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');
const { json } = require('express');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];
//const todos = [];


function checksExistsUserAccount(request, response, next) {

  const { username } = request.headers;
  const userAuth = users.find((user => user.username === username));

  if (!userAuth) {
    return response.status(404).json({
      "error": "User not found"
    })
  }
  request.user = userAuth;

  return next();
}

app.post('/users' , (request, response) => {

  const {username, name } = request.body
  const userExists = users.find((user => user.username === username));

  if (userExists) {
    return response.status(400).json({
      "error": "Username already exists"
    })
  }
  
  const user = { 
      id: uuidv4(), // precisa ser um uuid
      name, 
      username, 
      todos: []
  };
  users.push(user);
  
  return response.status(201).send(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {todos} = request.user
  return response.status(201).send(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const todo = 
  { 
    id: uuidv4(), 
    title: title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }

  user.todos.push(todo)
  return response.status(201).send(todo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request
  const { id } = request.params
  
  const todo = user.todos.find(todo => todo.id === id)
  if (!todo) {
    return response.status(404).json({
      "error": "Todo not found"
    })
  }
  todo.title = title;
  todo.deadline = new Date(deadline);
  return response.json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {

  const { user } = request
  const { id } = request.params
  
  const todo = user.todos.find(todo => todo.id === id)
  
  if (!todo) {
    return response.status(404).json({
      "error": "Todo not found"
    })
  }
  todo.done = true;

  return response.json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params
  
  const todoIndex = user.todos.findIndex(todo => todo.id === id)
  if (todoIndex === -1) {
    return response.status(404).json({
      "error": "Todo not found"
    })
  }
  
  user.todos.splice(todoIndex, 1)
  return response.status(204).json()
});

module.exports = app;