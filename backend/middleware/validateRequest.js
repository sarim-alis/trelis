export const validateRegister = (req, res, next) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  if (username.length < 3) {
    return res.status(400).json({ message: 'Username must be at least 3 characters' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }
  
  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  
  next();
};

export const validateBoard = (req, res, next) => {
  const { title } = req.body;
  
  if (!title || title.trim().length === 0) {
    return res.status(400).json({ message: 'Board title is required' });
  }
  
  next();
};

export const validateTask = (req, res, next) => {
  const { title, status } = req.body;
  
  if (!title || title.trim().length === 0) {
    return res.status(400).json({ message: 'Task title is required' });
  }
  
  if (status && !['todo', 'inprogress', 'done'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  
  next();
};
