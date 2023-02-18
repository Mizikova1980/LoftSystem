/**
 *
 *
 * @param {*} user
 * @returns



*/


const db = require('./../models')
module.exports.serializeUser = (user) => {
    return {
      firstName: user.firstName,
      id: user._id,
      image: user.image,
      middleName: user.middleName,
      permission: user.permission,
      surName: user.surName,
      username: user.username,
    }
  }
  
  module.exports.serializeNews = async (news) => {
    const user = await db.getUserById(news.user)
     
    const data = {
      id: news._id,
      title: news.title,
      text: news.text,
      created_at: news.created_at,
      user: {
        firstName: user.firstName,
        image: user.image,
        middleName: user.middleName,
        surName: user.surName,
        username: user.username,
        id: user.id
      }
    }

    
    //console.log(data)
    return data
  }
  