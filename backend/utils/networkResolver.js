/**
 * Network & Hardware Address Resolver Utility
 * Ensures distinct users have unique, realistic IP addresses and MAC hardware IDs.
 */

export const resolveNetworkDetails = (req, userId = 'UNKNOWN', role = 'User') => {
  let ip = req?.ip || req?.headers?.['x-forwarded-for'] || '127.0.0.1';

  // Deterministically compute a unique IP and MAC based on userId & role
  const str = `${userId}-${role}`.toLowerCase();
  let hashNum = 0;
  for (let i = 0; i < str.length; i++) {
    hashNum = (hashNum * 31 + str.charCodeAt(i)) & 0xFFFFFFF;
  }

  // If local loopback, assign realistic subnet IP (e.g. 192.168.1.104 for Principal, 192.168.2.45 for Teacher, etc.)
  if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.includes('::ffff:127.0.0.1')) {
    let subnet = 1;
    if (role === 'Teacher') subnet = 2;
    if (role === 'HOD') subnet = 3;
    if (role === 'Exam Controller') subnet = 4;
    if (role === 'Auditor') subnet = 5;

    const hostOctet = 10 + (hashNum % 230);
    ip = `192.168.${subnet}.${hostOctet}`;
  }

  // Generate unique MAC hardware address
  const b1 = ((hashNum >> 16) & 0xFF).toString(16).padStart(2, '0').toUpperCase();
  const b2 = ((hashNum >> 8) & 0xFF).toString(16).padStart(2, '0').toUpperCase();
  const b3 = (hashNum & 0xFF).toString(16).padStart(2, '0').toUpperCase();

  // Role prefix for MAC
  let prefix = 'A4-83-E7';
  if (role === 'Principal') prefix = 'F4-0F-24';
  if (role === 'Exam Controller') prefix = '88-1E-A3';
  if (role === 'HOD') prefix = 'C4-B3-01';

  const mac = `${prefix}-${b1}-${b2}`;

  return {
    ipAddress: ip,
    macAddress: mac
  };
};
