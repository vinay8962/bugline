// Check if user is super admin
export const requireSuperAdmin = (req, res, next) => {
    if (req.user.global_role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Super admin access required'
      });
    }
    next();
  };