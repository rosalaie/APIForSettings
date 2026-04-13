const express = require('express')
const { PrismaClient } = require('@prisma/client')

const app = express()
const prisma = new PrismaClient()

app.use(express.json())




app.get('/users', async (req,res) =>{
  const users = await prisma.user.findMany()
  res.json(users)
})

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000')
})

app.post('/users', async (req, res) => {
  const { nome, email } = req.body

  const user = await prisma.user.create({
    data: { nome, email }
  })

  res.json(user)
})