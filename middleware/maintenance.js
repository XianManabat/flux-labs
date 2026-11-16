const path = require('path');

const OPEN_PATHS = ['/login', '/login.html', '/maintenance.html'];
const OPEN_PREFIXES = ['/css/', '/images/', '/jsStyles/'];

function maintenanceGate( req , res , next ) {
    const isOn = process.env.MAINTENANCE_MODE === 'true';
    const isAdmin = req.session.role === 'admin';
    const isOpen = OPEN_PATHS.includes(req.path)
        || OPEN_PREFIXES.some(prefix => req.path.startsWith(prefix));

    if (!isOn || isAdmin || isOpen) {
        return next();
    }
    res.status(503).sendFile(path.join(__dirname, '..', 'public', 'maintenance.html'));
}

module.exports = { maintenanceGate };