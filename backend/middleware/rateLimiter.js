const requestCounts = new Map();

export const rateLimiter = (maxRequests = 100, windowMs = 60000) => {
  return (req, res, next) => {
    const identifier = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!requestCounts.has(identifier)) {
      requestCounts.set(identifier, []);
    }
    
    const requests = requestCounts.get(identifier);
    const recentRequests = requests.filter(time => now - time < windowMs);
    
    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({ 
        message: 'Too many requests, please try again later',
        retryAfter: Math.ceil((recentRequests[0] + windowMs - now) / 1000)
      });
    }
    
    recentRequests.push(now);
    requestCounts.set(identifier, recentRequests);
    
    setTimeout(() => {
      if (requestCounts.has(identifier)) {
        const filtered = requestCounts.get(identifier).filter(time => Date.now() - time < windowMs);
        if (filtered.length === 0) {
          requestCounts.delete(identifier);
        } else {
          requestCounts.set(identifier, filtered);
        }
      }
    }, windowMs);
    
    next();
  };
};
