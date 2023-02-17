  
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
        image: '',
        permission: {
            chat: { C: true, R: true, U: true, D: true },
            news: { C: true, R: true, U: true, D: true },
            settings: { C: true, R: true, U: true, D: true },
        },
        accessToken: '',
        refreshToken: '',
        accessTokenExpiredAt: '',
        refreshTokenExpiredAt: '',
    })
    newUser.setPassword(password)
    const user = await newUser.save()
    return user
 }


 module.exports.updateUser = async (id, update) => {
   return User.findByIdAndUpdate({_id: id}, update)
    
 }    


 module.exports.deleteUser = async (id) => {
     return User.findByIdAndDelete({_id: id})
 }



 module.exports.getNews = async () => {
   return News.find()
}

module.exports.createNews = async (data, user) => {
   const {text, title} = data
   const newNews = new News ({
      text: data.text,
      title: data.title,
      user: {
          firstName: user.firstName,
          id: user.id,
          image: user.image,
          middleName: user.middleName,
          surName: user.surName,
          username: user.username
      }
})
   const news = await newNews.save()
   console.log(news)
   return news
}


module.exports.deleteNews = async (id) => {
   return News.findByIdAndDelete({_id: id})
    
 }

 module.exports.updateNews = async (id, update) => {
   return News.findByIdAndUpdate({_id: id}, update)
    
 }