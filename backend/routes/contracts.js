const express = require('express');
const Contract = require('../models/Contract');
const { authenticateUser, authorize } = require('../middleware/auth'); // Corrected import path
const authenticateAdmin = require('../middleware/authenticateAdmin'); // Ensure this is imported
const jsPDF = require('jspdf');
const router = express.Router();

// Generate a new contract
router.post('/generate', authenticateAdmin, authorize(['superadmin']), async (req, res) => {
  try {
    const { version, changelog, buyerDetails } = req.body;

    // Create a new contract
    const contract = new Contract({ version, changelog, buyerDetails });
    await contract.save();

    // Generate PDF
    const doc = new jsPDF();
    doc.text(`Contract Version: ${version}`, 10, 10);
    doc.text(`Changelog: ${changelog}`, 10, 20);
    doc.text(`Buyer Details:`, 10, 30);
    doc.text(`Company Name: ${buyerDetails.companyName}`, 10, 40);
    doc.text(`Address: ${buyerDetails.address}`, 10, 50);
    doc.text(`Representative Name: ${buyerDetails.representativeName}`, 10, 60);

    const pdfBuffer = doc.output('arraybuffer');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="contract.pdf"');
    res.send(Buffer.from(pdfBuffer));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Accept a contract
router.post('/accept/:id', authenticateAdmin, authorize(['superadmin']), async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ error: 'Contract not found' });

    contract.acceptedBy = req.user.id;
    contract.acceptedAt = new Date();
    await contract.save();

    res.json({ message: 'Contract accepted successfully', contract });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get contract history
router.get('/history', authenticateAdmin, authorize(['superadmin']), async (req, res) => {
  try {
    const contracts = await Contract.find().populate('acceptedBy', 'username').sort({ createdAt: -1 });
    res.json(contracts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
