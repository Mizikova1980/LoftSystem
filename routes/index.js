const express = require('express')
const router = express.Router()
const tokens = require('./../auth/tokens')
const passport = require('passport')
const db = require('./../models')
const helper = require('./../helpers/serialize')
const User = require('../models/schemas/user')


const auth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (!user || err) {
      return res.status(401).json({
        code: 401,
        message: 'Unauthorized',
      })
    }
    // TODO: check IP user
    req.user = user
    next()
  })(req, res, next)
}

router.post('/registration', async (req, res) => {
  const { username } = req.body

  console.log(username)
  const user = await db.getUserByName(username)
  if (user) {
    return res.status(409).json({
      message: `Пользователь ${username} существует`
    }) // TODO:
  }
  try {
    const newUser = await db.createUser(req.body)
    const token = await tokens.createTokens(newUser)
    res.json({
      ...helper.serializeUser(newUser),
      ...token,
    })
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: e.message })
  }
})

router.post('/login', async (req, res, next) => {
  passport.authenticate(
    'local',
    { session: false },
    async (err, user, info) => {
      if (err) {
        return next(err)
      }
      if (!user) {
        return res.status(400).json({ message: 'Не правильный логин/пароль'}) // TODO:
      }
      if (user) {
        const token = await tokens.createTokens(user)
        console.log(token)
        res.json({
          ...helper.serializeUser(user),
          ...token,
        })
      }
    },
  )(req, res, next)
})

router.post('/refresh-token', async (req, res) => {
  const refreshToken = req.headers['authorization']
  // TODO: compare token from DB
  const data = await tokens.refreshTokens(refreshToken)
  res.json({ ...data })
 
})

router.get('/profile', auth, async (req, res) => {
    const user = req.user
    res.json({
      ...helper.serializeUser(user),
    })
  })
  .patch('/profile', auth, async (req, res) => {
    console.log(`PATH: req.body: `)
    
      
    
  })

// получение списка новостей. Необходимо вернуть список всех новостей из базы данных.
 router.get('/news', async(req, res) => {
  const news = await db.getNews()
  console.log(news.length)
  return res.json(news)
  // новости получаю от сервера, но как из правильно отрендерить не понимаю?

})



// создание новой новости. Сигнатура запроса: { text, title }. Необходимо вернуть обновленный список всех новостей из базы данных.
router.post('/news', async(req, res) => {
  const newNews = await db.createNews(req.body)
  return res.json(newNews)
 
})

//обновление существующей новости. Сигнатура запроса: { text, title }. Необходимо вернуть обновленный список всех новостей из базы данных.
router.patch('/news/:id')


// удаление пользователя
router.delete('/users/:id', async (req, res) => {
  db.deleteUser(user.id)
})

// получение списка пользователей. Необходимо вернуть список всех пользоватлей из базы данных
router.get('/users', async (req, res) => {
  const users = await db.getUsers()
  res.json(users)

})



// PATCH-запрос на /api/users/:id/permission - обновление существующей записи о разрешениях конкретного пользователя. Сигнатура:

router.patch('/users/:id/permission')








module.exports = router




