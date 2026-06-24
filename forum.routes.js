const express = require('express');
const router = express.Router();

const { readDB, writeDB } = require('../utils/db');
const { requireAuth } = require('../middleware/auth.middleware');

router.get('/', (req, res) => {
  const { search = '', type = 'all' } = req.query;
  const db = readDB();
  let posts = db.forum;
  if (search) {
    const s = String(search).toLowerCase();
    posts = posts.filter(
      (p) => p.title.toLowerCase().includes(s) || p.text.toLowerCase().includes(s) || p.tags.some((t) => t.toLowerCase().includes(s))
    );
  }
  if (type !== 'all') posts = posts.filter((p) => p.type === type);
  res.json({ posts });
});

router.post('/', requireAuth, (req, res) => {
  const { title, content, category, tags } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Title and content required' });

  const db = readDB();
  const user = db.users.find((u) => u.id === req.user.id);
  const post = {
    id: Date.now(),
    userId: user.id,
    user: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email,
    av: ((user.firstName || '?')[0] + (user.lastName || '?')[0]).toUpperCase(),
    color: '#14b8c4',
    time: 'Just now',
    cat: category || 'General',
    catColor: '#0e7490',
    title,
    text: content,
    likes: 0,
    replies: 0,
    tags: tags && tags.length ? tags : [category || 'General'],
    type: 'questions',
  };
  db.forum.unshift(post);
  writeDB(db);
  res.json({ post });
});

router.post('/:id/like', (req, res) => {
  const db = readDB();
  const post = db.forum.find((p) => String(p.id) === req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  post.likes += 1;
  writeDB(db);
  res.json({ likes: post.likes });
});

module.exports = router;
