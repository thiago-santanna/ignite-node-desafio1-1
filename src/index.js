const express = require('express');
const cors = require('cors');
 const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

 const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers
  const user = users.find(usr => usr.username === username)
  if(!user){
    return response.status(404).json({message:"User not found."})
  }
  request.user = user
  return next()
}

app.post('/users', (request, response) => {
  const {  name, username } = request.body

  const existUser = users.find(user => user.username === username)
  if(existUser){
    return response.status(400).json({error:"User already exists"})
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user)
  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const todos = user.todos  
  response.status(201).json(todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {title, deadline} = request.body
  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  user.todos.push(newTodo)
  return response.status(201).json(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {title, deadline} = request.body
  const idTodo = request.params.id

  const existsUserTodo = user.todos.find(todo => todo.id === idTodo)
  if(!existsUserTodo){
    return response.status(404).json({error: 'Not Found'})
  }

  const todosUser = user.todos.map( tod => tod.id !== idTodo ? tod : { ...tod,  title: title, deadline: new Date(deadline) } )
  user.todos = todosUser
  const todoUpdated = user.todos.find( todo => todo.id === idTodo)
  return response.status(200).json(todoUpdated)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const idTodo = request.params.id

  const existsUserTodo = user.todos.find(todo => todo.id === idTodo)
  if(!existsUserTodo){
    return response.status(404).json({error: 'Not Found'})
  }

  const todosUser = user.todos.map( tod => tod.id !== idTodo ? tod : { ...tod,  done:true } )
  user.todos = todosUser
  const todoUpdated = user.todos.find( todo => todo.id === idTodo)
  return response.status(200).json(todoUpdated)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const idTodo = request.params.id

  const existTodo = user.todos.find( tod => tod.id === idTodo)
  if(!existTodo){
    return response.status(404).json({error: 'Not Found'})
  }

  const todosUser = user.todos.filter( tod => tod.id !== idTodo)
  user.todos = todosUser
  return response.status(204).send()  
});

module.exports = app;
