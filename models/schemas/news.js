const mongoose = require('mongoose')

const Schema = mongoose.Schema

const newsSchema = new Schema(
    {
        id: String,
        text: String,
        title: String,
        user: {
            firstName: String,
            id: String,
            image: String,
            middleName: String,
            surName: String,
            username: String
        }
       
    },
    {
        versionKey: false,
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
      },
)

const News = mongoose.model('news', newsSchema)

module.exports = News