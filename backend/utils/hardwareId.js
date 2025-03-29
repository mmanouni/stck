const si = require('systeminformation');
const crypto = require('crypto');

async function getHardwareId() {
  try {
    const motherboard = await si.baseboard();
    const disk = await si.diskLayout();

    if (!motherboard.serialNumber || !disk[0]?.serialNum) {
      throw new Error('Unable to retrieve hardware identifiers');
    }

    const rawId = `${motherboard.serialNumber}-${disk[0]?.serialNum}`;
    return crypto.createHash('sha256').update(rawId).digest('hex'); // Hash the ID
  } catch (err) {
    console.error('Error generating hardware ID:', err.message);
    throw new Error('Failed to generate hardware ID');
  }
}

module.exports = getHardwareId;
