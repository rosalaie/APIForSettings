const express = require('express')
const { PrismaClient } = require('@prisma/client')
const cors = require('cors')


const app = express()
const prisma = new PrismaClient()

app.use(cors())
app.use(express.json())




app.get('/users', async (req,res) =>{
  const users = await prisma.user.findMany()
  res.json(users)
})

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000')
})

app.post('/users', async (req, res) => {
  try {
    const { nome, email } = req.body

    const user = await 
    prisma.user.create({
      data: { nome, email}


    })
    res.json(user)

  } catch (error) {
    if (error.code === 'P2002'){
      return res.status(400).json({ error: 'Email já cadastrado'})
    }
    res.status(500).json({ error: 'Erro interno'})
  }
})


app.put('/users/:id', async (req, res) => {
  const { id } = req.params
  const { nome, email } = req.body

  const user = await prisma.user.update({
    where: { id: Number(id) },
    data: { nome, email }
  })

  res.json(user)
})

app.delete('/users/:id', async (req, res) => {
  const { id } = req.params

  await prisma.user.delete({
    where: { id: Number(id) }
  })

  res.json({ message: "Usuário deletado" })
})

app.get('/users/:id', async (req, res) =>{
  const { id } = req.params
    const user = await 
    prisma.user.findUnique({
      where: { id: Number(id)}
    })

    res.json(user)
  })