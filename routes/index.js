const express = require('express')
const router = express.Router()
const tokens = require('./../auth/tokens')
const passport = require('passport')
const db = require('./../models')
const helper = require('./../helpers/serialize')
const User = require('../models/schemas/user')
const formidable = require('formidable')
const fs = require('fs')
const path = require('path')
const News = require('../models/schemas/news')
const { update } = require('lodash')
const bCrypt = require('bcryptjs')



const auth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (!user || err) {
      return res.status(401).json({
        code: 401,
        message: 'Unauthorized',
      })
    }
        
    req.user = user
    next()
  })(req, res, next)
}

//создание нового пользователя (регистрация)
router.post('/registration', async (req, res) => {
  const { username } = req.body

  console.log(username)
  const user = await db.getUserByName(username)
  if (user) {
    return res.status(409).json({
      message: `Пользователь ${username} существует`
    }) 
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


//авторизация после пользовательского ввода
router.post('/login', async (req, res, next) => {
  passport.authenticate(
    'local',
    { session: false },
    async (err, user, info) => {
      if (err) {
        return next(err)
      }
      if (!user) {
        return res.status(400).json({ message: 'Не правильный логин/пароль'}) 
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


//обновление access-токена
router.post('/refresh-token', async (req, res) => {
  const refreshToken = req.headers['authorization']
  // TODO: compare token from DB
  const data = await tokens.refreshTokens(refreshToken)
  console.log(data)
  res.json({ ...data })
 
})

//получение информации о пользователе
router.get('/profile', auth, async (req, res) => {
   const user = req.user
    res.json({
      ...helper.serializeUser(user),
    })
  })
//обновление информации о пользователе
router.patch('/profile', auth, function(req, res){
    
    const userId = req.user.id
    const form = new formidable.IncomingForm()
    const upload = path.join('./uploads', 'assets', 'img')
    form.uploadDir = upload
    form.parse(req, function (err, fields, files) {
      if (err) {
        return next(err)
      } 
      if(files.avatar) {
        const fileName = path.join(upload, files.avatar.originalFilename)
        fs.rename(files.avatar.filepath, fileName, function (err) {
                    
        const src = path.join('./', 'assets','img', files.avatar.originalFilename)

        function setPassword (password) {
         return this.hash = bCrypt.hashSync(password, bCrypt.genSaltSync(10), null)
          
        }
     


        db.getUserById(userId)
       .then(function(user){
        function setPassword (password) {
          return this.hash = bCrypt.hashSync(password, bCrypt.genSaltSync(10), null)
           
         }
        const hash = setPassword(fields.newPassword)
         console.log(hash)
          user.firstName = fields.firstName
          user.middleName = fields.middleName, 
          user.surName = fields.surName, 
          user.hash = hash,
          user.image = src,
          user.save()
          .then(function(updateUser){
            res.send(updateUser)
          })
          .catch(function (err){
            return res.status(401).json({message: err});
          })

        })
        })
      } else {
        db.getUserById(userId)
        .then(function(user){
          function setPassword (password) {
            return this.hash = bCrypt.hashSync(password, bCrypt.genSaltSync(10), null)
             
           }
          const hash = setPassword(fields.newPassword)
                   
          user.firstName = fields.firstName
           user.middleName = fields.middleName, 
           user.surName = fields.surName, 
           user.hash = hash,
           user.save()
           .then(function(updateUser){
             res.send(updateUser)
           })
           .catch(function (err){
             return res.status(401).json({message: err});
           })
                      
         })
      }
    })
})



// получение списка новостей.
 router.get('/news', async(req, res) => {
  try {
    const data = await db.getNews()
    const newNews = data.map(async (item) => await helper.serializeNews(item))
    const news = await Promise.all(newNews)
    console.log(news)
    return res.json(news)
  } catch (error) {
    console.log(error)  
  }
 })


// создание новой новости.
router.post('/news', auth, async (req, res) => {
  
  try {
    const userId = req.user.id
    const user = await db.getUserById(userId)
    const newNews = await db.createNews(req.body, user)
    const data = await db.getNews()
    const news = data.map((item) => helper.serializeNews(item))
    const updateNews = await Promise.all(news)
    return res.json(updateNews)
  } catch (error) {
    console.log(error)
  }
})

//обновление существующей новости.
router.patch('/news/:id', async (req, res) => {
  try {
    const updateNews = await db.updateNews(req.params.id, {
      title: req.body.title,
      text: req.body.text
    })
    const data = await db.getNews()
    const newNews = data.map(async (item) => await helper.serializeNews(item))
    const news = await Promise.all(newNews)
    return res.json(news)
  } catch (error) {
    console.log(error)
  }
 
})

//удаление существующей новости.
router.delete('/news/:id', async (req, res) => {
  try {
    const deleteNews = await db.deleteNews(req.params.id)
    const data = await db.getNews()
    const newNews = data.map(async (item) => await helper.serializeNews(item))
    const news = await Promise.all(newNews)
    return res.json(news)
  } catch (error) {
    console.log(error)
  }
})

// получение списка пользователей
router.get('/users', async(req, res) => {
  try {
    const data = await db.getUsers()
    const users = data.map((item) => helper.serializeUser(item))
    return res.json(users)
  } catch (error) {
    console.log(error)
  }
})


// удаление пользователя
router.delete('/users/:id', async (req, res) => {
  try {
    const deleteUser = await db.deleteUser(req.params.id)
    const data = await db.getUsers()
    const users = data.map((item) => helper.serializeUser(item))
    return res.json(users)
  } catch (error) {
    console.log(error)
  }
})

// обновление существующей записи о разрешениях конкретного пользователя
router.patch('/users/:id/permission', async (req, res) => {
  try {
    const updateUser = await db.updateUser(req.params.id, {
      permission: req.body.permission,
    })
   const data = await db.getUsers()
   const users = data.map((item) => helper.serializeUser(item))
   return res.json(users)
  } catch (error) {
    console.log(error)
  }
})


module.exports = router




