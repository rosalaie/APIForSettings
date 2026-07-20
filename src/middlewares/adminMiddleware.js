export function adminMiddleware(req, res, next) {
  if (req.userRole !== 'ADMIN') {
    return res.status(403).json({ error: 'Acesso negado. Restrito a administradores.' });
  }
  return next();
}