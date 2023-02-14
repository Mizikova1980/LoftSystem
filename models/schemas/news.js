const mongoose = require('mongoose')

const Schema = mongoose.Schema

const newsSchema = new Schema(
    {
        
        text: {
            type: String,
        },
        title: {
            type: String,
        },
       
    },
    {
        versionKey: false,
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
      },
)

const News = mongoose.model('news', newsSchema)

module.exports = News