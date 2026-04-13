const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

exports.createUser = async (req, res) => {
  const { nome, email } = req.body
  const user = await prisma.user.create({
    data: { nome, email }
  })
  res.json(user)
}

exports.getUsers = async (req, res) => {
  const users = await prisma.user.findMany()
  res.json(users)
}