 const User = require('./schemas/user')
 const News = require('./schemas/news')
 const helper = require('./../helpers/serialize.js')
 const db = require('./../models')

 module.exports.getUserByName = async (username) => {
    return User.findOne({username})
 }

 module.exports.getUserById = async (id) => {
    return User.findById({_id: id})
 }

 module.exports.getUsers = async () => {
    return User.find()
 }

 module.exports.createUser = async (data) => {
    const {username, surName, firstName, middleName, password} = data
    const newUser = new User ({
        username: username,
        surName,
        firstName,
        middleName,
        image: 'https://icons-for-free.com/iconfiles/png/512/profile+user+icon-1320166082804563970.png',
        permission: {
            chat: { C: true, R: true, U: true, D: true },
            news: { C: true, R: true, U: true, D: true },
            settings: { C: true, R: true, U: true, D: true },
        },
    })
    newUser.setPassword(password)
    const user = await newUser.save()
    return user
 }


 module.exports.updateUser = async (data, user, paramsId) => {
   const {username, surName, firstName, middleName, password} = data

 }


 module.exports.deleteUser = async (id) => {
     return User.findByIdAndDelete({_id: id})
 }
















 module.exports.getNews = async () => {
   return News.find()
}

module.exports.createNews = async (data) => {
   const {text, title} = data
   const newNews = new News ({
      text,
      title,
   })
   const news = await newNews.save()
   console.log(news)
   return news
}




 