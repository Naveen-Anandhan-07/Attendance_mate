const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/backupController');

router.get('/export', ctrl.exportBackup);
router.post('/import', ctrl.importBackup);
router.delete('/clear-all', ctrl.clearAll);

module.exports = router;
