const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas using .env
const mongoUri = process.env.MONGODB_URI;
mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const postSchema = new mongoose.Schema({
    title: String,
    description: String,
    content: String,
    image: String,
    date: String,
    author: String
});

const Post = mongoose.model('Post', postSchema);

// Get all posts
app.get('https://zeroshot.onrender.com/api/posts', async (req, res) => {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
});

// Add a new post
app.post('https://zeroshot.onrender.com/api/posts', async (req, res) => {
    const post = new Post(req.body);
    await post.save();
    res.json(post);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
