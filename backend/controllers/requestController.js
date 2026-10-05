import { DownloadRequest } from '../models/DownloadRequest.js';
import { QuestionPaper } from '../models/QuestionPaper.js';
import { AccessLog } from '../models/AccessLog.js';
import { inspectSecurityAnomaly } from '../services/securityDetector.js';
import { resolveNetworkDetails } from '../utils/networkResolver.js';

export const createDownloadRequest = async (req, res) => {
  try {
    const { paperId, reason } = req.body;
    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    const netDetails = resolveNetworkDetails(req, req.user.userId, req.user.role);
    const deviceInfo = req.headers['user-agent'] || 'Chrome / Windows 11 Workstation';

    if (!paperId || !reason) {
      return res.status(400).json({ message: 'Paper ID and justification reason are required.' });
    }

    const paper = await QuestionPaper.findOne({ where: { paperId } });
    if (!paper) {
      return res.status(404).json({ message: 'Question paper not found.' });
    }

    const requestId = `REQ-${Date.now().toString(36).toUpperCase()}`;

    const request = await DownloadRequest.create({
      requestId,
      paperId: paper.paperId,
      paperTitle: `${paper.subject} (${paper.subjectCode})`,
      targetTeacherId: paper.uploadedBy,
      targetTeacherName: paper.uploadedByName || 'Prof. Alan Turing',
      requestedBy: req.user.userId,
      requestedByName: req.user.name,
      role: req.user.role,
      department: req.user.department || paper.department,
      reason,
      requestedDate: todayStr,
      requestedTime: timeStr,
      deviceInfo,
      ipAddress: netDetails.ipAddress,
      macAddress: netDetails.macAddress,
      status: 'Pending'
    });

    paper.status = 'Download Requested';
    await paper.save();

    await AccessLog.create({
      userId: req.user.userId,
      userName: req.user.name,
      role: req.user.role,
      action: 'Requested Download',
      paperId: paper.paperId,
      paperTitle: `${paper.subject} (${paper.subjectCode})`,
      date: todayStr,
      time: timeStr,
      sessionId: `SESS-${Date.now().toString(36).toUpperCase()}`,
      deviceInfo,
      ipAddress: netDetails.ipAddress,
      macAddress: netDetails.macAddress,
      result: 'Success',
      reason: `Download request submitted to ${paper.uploadedByName} for paper ${paper.subject}. Reason: ${reason}`
    });

    await inspectSecurityAnomaly({
      userId: req.user.userId,
      userName: req.user.name,
      paperId: paper.paperId,
      action: 'Requested Download',
      result: 'Success',
      ipAddress: netDetails.ipAddress,
      deviceInfo
    });

    res.status(201).json({ message: 'Download request submitted for Principal approval.', request });
  } catch (error) {
    console.error('Create download request error:', error);
    res.status(500).json({ message: 'Server error creating download request.' });
  }
};

export const getDownloadRequests = async (req, res) => {
  try {
    const requests = await DownloadRequest.findAll({
      order: [['createdAt', 'DESC']]
    });

    const paperIds = [...new Set(requests.map(r => r.paperId))];
    const papers = await QuestionPaper.findAll({
      where: { paperId: paperIds }
    });
    const paperMap = new Map(papers.map(p => [p.paperId, p]));

    const formattedRequests = requests.map(reqItem => {
      const plainReq = reqItem.get({ plain: true });
      const paperObj = paperMap.get(plainReq.paperId);
      plainReq.targetTeacherName = plainReq.targetTeacherName || paperObj?.uploadedByName || 'Prof. Alan Turing';
      plainReq.targetTeacherId = plainReq.targetTeacherId || paperObj?.uploadedBy || 'TCH-101';
      return plainReq;
    });

    res.json({ requests: formattedRequests });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ message: 'Server error fetching download requests.' });
  }
};

export const approveDownloadRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });

    const request = await DownloadRequest.findOne({ where: { requestId } });
    if (!request) {
      return res.status(404).json({ message: 'Download request not found.' });
    }

    request.status = 'Approved';
    request.approvedBy = req.user.userId;
    request.approvedByName = req.user.name;
    request.approvedAt = `${todayStr} ${timeStr}`;
    await request.save();

    const paper = await QuestionPaper.findOne({ where: { paperId: request.paperId } });
    if (paper) {
      paper.status = 'Download Approved';
      await paper.save();
    }

    await AccessLog.create({
      userId: req.user.userId,
      userName: req.user.name,
      role: req.user.role,
      action: 'Approved Download',
      paperId: request.paperId,
      paperTitle: request.paperTitle,
      date: todayStr,
      time: timeStr,
      sessionId: `SESS-${Date.now().toString(36).toUpperCase()}`,
      deviceInfo: req.headers['user-agent'] || 'Chrome/Windows',
      ipAddress: req.ip || '127.0.0.1',
      result: 'Approved',
      reason: `Principal ${req.user.name} approved download request ${requestId} for user ${request.requestedByName}`
    });

    res.json({ message: 'Download request approved successfully.', request });
  } catch (error) {
    console.error('Approve request error:', error);
    res.status(500).json({ message: 'Server error approving download request.' });
  }
};

export const rejectDownloadRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { rejectionReason } = req.body;
    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });

    const request = await DownloadRequest.findOne({ where: { requestId } });
    if (!request) {
      return res.status(404).json({ message: 'Download request not found.' });
    }

    request.status = 'Rejected';
    request.rejectionReason = rejectionReason || 'Principal review rejected access.';
    await request.save();

    const paper = await QuestionPaper.findOne({ where: { paperId: request.paperId } });
    if (paper) {
      paper.status = 'Access Restricted';
      await paper.save();
    }

    await AccessLog.create({
      userId: req.user.userId,
      userName: req.user.name,
      role: req.user.role,
      action: 'Rejected Download',
      paperId: request.paperId,
      paperTitle: request.paperTitle,
      date: todayStr,
      time: timeStr,
      sessionId: `SESS-${Date.now().toString(36).toUpperCase()}`,
      deviceInfo: req.headers['user-agent'] || 'Chrome/Windows',
      ipAddress: req.ip || '127.0.0.1',
      result: 'Rejected',
      reason: `Download request ${requestId} rejected. Reason: ${rejectionReason || 'Security policy restriction'}`
    });

    res.json({ message: 'Download request rejected.', request });
  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({ message: 'Server error rejecting download request.' });
  }
};
