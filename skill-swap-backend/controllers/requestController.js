const SwapRequest = require('../models/SwapRequest');
const User = require('../models/User');

/**
 * Request Controller
 * Handles swap request management
 */

/**
 * @desc    Get all swap requests for a user
 * @route   GET /api/requests
 * @access  Private
 */
const getSwapRequests = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      role = 'all',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Build query
    let query = {};
    
    if (status) {
      query.status = status;
    }

    // Filter by role (requester, recipient, or both)
    if (role === 'requester') {
      query.requester = req.user.id;
    } else if (role === 'recipient') {
      query.recipient = req.user.id;
    } else {
      query.$or = [
        { requester: req.user.id },
        { recipient: req.user.id }
      ];
    }

    const requests = await SwapRequest.find(query)
      .populate('requester', 'name avatar location rating')
      .populate('recipient', 'name avatar location rating')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SwapRequest.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        requests,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Swap requests retrieved successfully'
    });
  } catch (error) {
    console.error('Get swap requests error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get swap requests',
      message: error.message
    });
  }
};

/**
 * @desc    Get swap request by ID
 * @route   GET /api/requests/:id
 * @access  Private
 */
const getSwapRequestById = async (req, res) => {
  try {
    const request = await SwapRequest.findById(req.params.id)
      .populate('requester', 'name avatar location rating')
      .populate('recipient', 'name avatar location rating');

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found',
        message: 'Swap request not found'
      });
    }

    // Check if user is involved in the request
    if (request.requester._id.toString() !== req.user.id && 
        request.recipient._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only view requests you are involved in'
      });
    }

    res.status(200).json({
      success: true,
      data: request,
      message: 'Swap request retrieved successfully'
    });
  } catch (error) {
    console.error('Get swap request by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get swap request',
      message: error.message
    });
  }
};

/**
 * @desc    Create swap request
 * @route   POST /api/requests
 * @access  Private
 */
const createSwapRequest = async (req, res) => {
  try {
    const {
      recipient,
      skillOffered,
      skillWanted,
      message,
      scheduledDate,
      duration,
      location,
      isOnline,
      notes
    } = req.body;

    // Check if recipient exists
    const recipientUser = await User.findById(recipient);
    if (!recipientUser) {
      return res.status(404).json({
        success: false,
        error: 'Recipient not found',
        message: 'The recipient user does not exist'
      });
    }

    // Check if recipient is the same as requester
    if (recipient === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'Invalid recipient',
        message: 'You cannot send a request to yourself'
      });
    }

    // Check if there's already a pending request between these users
    const existingRequest = await SwapRequest.findOne({
      requester: req.user.id,
      recipient: recipient,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        error: 'Request already exists',
        message: 'You already have a pending request with this user'
      });
    }

    // Create swap request
    const swapRequest = await SwapRequest.create({
      requester: req.user.id,
      recipient,
      skillOffered,
      skillWanted,
      message: message || '',
      scheduledDate: scheduledDate || null,
      duration: duration || 60,
      location: location || '',
      isOnline: isOnline || false,
      notes: notes || ''
    });

    // Populate request details
    const populatedRequest = await SwapRequest.findById(swapRequest._id)
      .populate('requester', 'name avatar location rating')
      .populate('recipient', 'name avatar location rating');

    res.status(201).json({
      success: true,
      data: populatedRequest,
      message: 'Swap request created successfully'
    });
  } catch (error) {
    console.error('Create swap request error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create swap request',
      message: error.message
    });
  }
};

/**
 * @desc    Update swap request
 * @route   PUT /api/requests/:id
 * @access  Private
 */
const updateSwapRequest = async (req, res) => {
  try {
    const {
      skillOffered,
      skillWanted,
      message,
      scheduledDate,
      duration,
      location,
      isOnline,
      notes
    } = req.body;

    const request = await SwapRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found',
        message: 'Swap request not found'
      });
    }

    // Check if user is the requester
    if (request.requester.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only update requests you created'
      });
    }

    // Check if request is still pending
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Cannot update',
        message: 'You can only update pending requests'
      });
    }

    // Update fields
    if (skillOffered) request.skillOffered = skillOffered;
    if (skillWanted) request.skillWanted = skillWanted;
    if (message !== undefined) request.message = message;
    if (scheduledDate !== undefined) request.scheduledDate = scheduledDate;
    if (duration !== undefined) request.duration = duration;
    if (location !== undefined) request.location = location;
    if (isOnline !== undefined) request.isOnline = isOnline;
    if (notes !== undefined) request.notes = notes;

    await request.save();

    // Populate updated request
    const populatedRequest = await SwapRequest.findById(request._id)
      .populate('requester', 'name avatar location rating')
      .populate('recipient', 'name avatar location rating');

    res.status(200).json({
      success: true,
      data: populatedRequest,
      message: 'Swap request updated successfully'
    });
  } catch (error) {
    console.error('Update swap request error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update swap request',
      message: error.message
    });
  }
};

/**
 * @desc    Accept swap request
 * @route   PUT /api/requests/:id/accept
 * @access  Private
 */
const acceptRequest = async (req, res) => {
  try {
    const { reason } = req.body;

    const request = await SwapRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found',
        message: 'Swap request not found'
      });
    }

    // Check if user is the recipient
    if (request.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only accept requests sent to you'
      });
    }

    // Check if request is pending
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Cannot accept',
        message: 'You can only accept pending requests'
      });
    }

    // Accept the request
    request.status = 'accepted';
    if (reason) request.acceptanceReason = reason;
    await request.save();

    // Update user swap counts
    await User.findByIdAndUpdate(request.requester, {
      $inc: { totalSwaps: 1 }
    });

    await User.findByIdAndUpdate(request.recipient, {
      $inc: { totalSwaps: 1 }
    });

    // Populate updated request
    const populatedRequest = await SwapRequest.findById(request._id)
      .populate('requester', 'name avatar location rating')
      .populate('recipient', 'name avatar location rating');

    res.status(200).json({
      success: true,
      data: populatedRequest,
      message: 'Swap request accepted successfully'
    });
  } catch (error) {
    console.error('Accept request error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to accept request',
      message: error.message
    });
  }
};

/**
 * @desc    Reject swap request
 * @route   PUT /api/requests/:id/reject
 * @access  Private
 */
const rejectRequest = async (req, res) => {
  try {
    const { reason } = req.body;

    const request = await SwapRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found',
        message: 'Swap request not found'
      });
    }

    // Check if user is the recipient
    if (request.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only reject requests sent to you'
      });
    }

    // Check if request is pending
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Cannot reject',
        message: 'You can only reject pending requests'
      });
    }

    // Reject the request
    request.status = 'rejected';
    request.rejectionReason = reason || '';
    request.rejectedAt = new Date();
    await request.save();

    // Populate updated request
    const populatedRequest = await SwapRequest.findById(request._id)
      .populate('requester', 'name avatar location rating')
      .populate('recipient', 'name avatar location rating');

    res.status(200).json({
      success: true,
      data: populatedRequest,
      message: 'Swap request rejected successfully'
    });
  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reject request',
      message: error.message
    });
  }
};

/**
 * @desc    Cancel swap request
 * @route   PUT /api/requests/:id/cancel
 * @access  Private
 */
const cancelRequest = async (req, res) => {
  try {
    const request = await SwapRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found',
        message: 'Swap request not found'
      });
    }

    // Check if user is the requester
    if (request.requester.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only cancel requests you created'
      });
    }

    // Check if request can be cancelled
    if (!['pending', 'accepted'].includes(request.status)) {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel',
        message: 'You can only cancel pending or accepted requests'
      });
    }

    // Cancel the request
    request.status = 'cancelled';
    request.cancelledAt = new Date();
    await request.save();

    // Populate updated request
    const populatedRequest = await SwapRequest.findById(request._id)
      .populate('requester', 'name avatar location rating')
      .populate('recipient', 'name avatar location rating');

    res.status(200).json({
      success: true,
      data: populatedRequest,
      message: 'Swap request cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel request error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel request',
      message: error.message
    });
  }
};

/**
 * @desc    Complete swap request
 * @route   PUT /api/requests/:id/complete
 * @access  Private
 */
const completeRequest = async (req, res) => {
  try {
    const request = await SwapRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found',
        message: 'Swap request not found'
      });
    }

    // Check if user is involved in the request
    if (request.requester.toString() !== req.user.id && 
        request.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only complete requests you are involved in'
      });
    }

    // Check if request is accepted
    if (request.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        error: 'Cannot complete',
        message: 'You can only complete accepted requests'
      });
    }

    // Complete the request
    request.status = 'completed';
    request.completedAt = new Date();
    await request.save();

    // Update user completed swap counts
    await User.findByIdAndUpdate(request.requester, {
      $inc: { completedSwaps: 1 }
    });

    await User.findByIdAndUpdate(request.recipient, {
      $inc: { completedSwaps: 1 }
    });

    // Populate updated request
    const populatedRequest = await SwapRequest.findById(request._id)
      .populate('requester', 'name avatar location rating')
      .populate('recipient', 'name avatar location rating');

    res.status(200).json({
      success: true,
      data: populatedRequest,
      message: 'Swap request completed successfully'
    });
  } catch (error) {
    console.error('Complete request error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete request',
      message: error.message
    });
  }
};

/**
 * @desc    Get pending requests
 * @route   GET /api/requests/pending
 * @access  Private
 */
const getPendingRequests = async (req, res) => {
  try {
    const requests = await SwapRequest.find({
      $or: [
        { requester: req.user.id },
        { recipient: req.user.id }
      ],
      status: 'pending'
    })
      .populate('requester', 'name avatar location rating')
      .populate('recipient', 'name avatar location rating')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests,
      message: 'Pending requests retrieved successfully'
    });
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get pending requests',
      message: error.message
    });
  }
};

/**
 * @desc    Get active swaps
 * @route   GET /api/requests/active
 * @access  Private
 */
const getActiveSwaps = async (req, res) => {
  try {
    const requests = await SwapRequest.find({
      $or: [
        { requester: req.user.id },
        { recipient: req.user.id }
      ],
      status: 'accepted'
    })
      .populate('requester', 'name avatar location rating')
      .populate('recipient', 'name avatar location rating')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: requests,
      message: 'Active swaps retrieved successfully'
    });
  } catch (error) {
    console.error('Get active swaps error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get active swaps',
      message: error.message
    });
  }
};

/**
 * @desc    Get completed swaps
 * @route   GET /api/requests/completed
 * @access  Private
 */
const getCompletedSwaps = async (req, res) => {
  try {
    const requests = await SwapRequest.find({
      $or: [
        { requester: req.user.id },
        { recipient: req.user.id }
      ],
      status: 'completed'
    })
      .populate('requester', 'name avatar location rating')
      .populate('recipient', 'name avatar location rating')
      .sort({ completedAt: -1 });

    res.status(200).json({
      success: true,
      data: requests,
      message: 'Completed swaps retrieved successfully'
    });
  } catch (error) {
    console.error('Get completed swaps error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get completed swaps',
      message: error.message
    });
  }
};

module.exports = {
  getSwapRequests,
  getSwapRequestById,
  createSwapRequest,
  updateSwapRequest,
  acceptRequest,
  rejectRequest,
  cancelRequest,
  completeRequest,
  getPendingRequests,
  getActiveSwaps,
  getCompletedSwaps
};
