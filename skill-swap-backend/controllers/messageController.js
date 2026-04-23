const Message = require('../models/Message');
const SwapRequest = require('../models/SwapRequest');

/**
 * Message Controller
 * Handles messaging functionality
 */

/**
 * @desc    Get conversations for a user
 * @route   GET /api/messages/conversations
 * @access  Private
 */
const getConversations = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Get unique swap requests where user is involved
    const conversations = await SwapRequest.aggregate([
      {
        $match: {
          $or: [
            { requester: req.user.id },
            { recipient: req.user.id }
          ],
          status: 'accepted' // Only show conversations for accepted swaps
        }
      },
      {
        $lookup: {
          from: 'messages',
          let: { swapRequestId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$swapRequest', '$$swapRequestId'] },
                deletedAt: null
              }
            },
            { $sort: { createdAt: -1 } },
            { $limit: 1 }
          ],
          as: 'lastMessage'
        }
      },
      {
        $lookup: {
          from: 'messages',
          let: { swapRequestId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$swapRequest', '$$swapRequestId'] },
                receiver: req.user.id,
                isRead: false,
                deletedAt: null
              }
            }
          ],
          as: 'unreadMessages'
        }
      },
      {
        $project: {
          swapRequest: '$_id',
          requester: 1,
          recipient: 1,
          skillOffered: 1,
          skillWanted: 1,
          lastMessage: { $arrayElemAt: ['$lastMessage', 0] },
          unreadCount: { $size: '$unreadMessages' },
          createdAt: 1
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'requester',
          foreignField: '_id',
          as: 'requesterUser'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'recipient',
          foreignField: '_id',
          as: 'recipientUser'
        }
      },
      { $sort: { 'lastMessage.createdAt': -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]);

    // Get total count
    const total = await SwapRequest.countDocuments({
      $or: [
        { requester: req.user.id },
        { recipient: req.user.id }
      ],
      status: 'accepted'
    });

    res.status(200).json({
      success: true,
      data: {
        conversations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Conversations retrieved successfully'
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get conversations',
      message: error.message
    });
  }
};

/**
 * @desc    Get messages in a conversation
 * @route   GET /api/messages/conversation/:swapRequestId
 * @access  Private
 */
const getMessages = async (req, res) => {
  try {
    const { swapRequestId } = req.params;
    const { page = 1, limit = 50, before, after } = req.query;

    // Check if user is involved in the swap request
    const swapRequest = await SwapRequest.findById(swapRequestId);
    if (!swapRequest) {
      return res.status(404).json({
        success: false,
        error: 'Swap request not found',
        message: 'Swap request not found'
      });
    }

    if (swapRequest.requester.toString() !== req.user.id && 
        swapRequest.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only view messages from conversations you are involved in'
      });
    }

    const messages = await Message.getConversation(swapRequestId, {
      page: parseInt(page),
      limit: parseInt(limit),
      before,
      after
    });

    res.status(200).json({
      success: true,
      data: {
        messages,
        swapRequestId
      },
      message: 'Messages retrieved successfully'
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get messages',
      message: error.message
    });
  }
};

/**
 * @desc    Send message
 * @route   POST /api/messages
 * @access  Private
 */
const sendMessage = async (req, res) => {
  try {
    const { swapRequest, receiver, content, messageType = 'text' } = req.body;

    // Check if swap request exists and user is involved
    const swapRequestDoc = await SwapRequest.findById(swapRequest);
    if (!swapRequestDoc) {
      return res.status(404).json({
        success: false,
        error: 'Swap request not found',
        message: 'Swap request not found'
      });
    }

    // Check if swap request is accepted
    if (swapRequestDoc.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        error: 'Cannot send message',
        message: 'You can only send messages for accepted swap requests'
      });
    }

    // Check if user is involved in the swap request
    if (swapRequestDoc.requester.toString() !== req.user.id && 
        swapRequestDoc.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only send messages to conversations you are involved in'
      });
    }

    // Check if receiver is the other person in the swap request
    const otherUserId = swapRequestDoc.requester.toString() === req.user.id 
      ? swapRequestDoc.recipient.toString() 
      : swapRequestDoc.requester.toString();

    if (receiver !== otherUserId) {
      return res.status(400).json({
        success: false,
        error: 'Invalid receiver',
        message: 'You can only send messages to the other person in the swap request'
      });
    }

    // Create message
    const message = await Message.create({
      swapRequest,
      sender: req.user.id,
      receiver,
      content,
      messageType
    });

    // Populate message details
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar');

    res.status(201).json({
      success: true,
      data: populatedMessage,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message',
      message: error.message
    });
  }
};

/**
 * @desc    Mark messages as read
 * @route   PUT /api/messages/conversation/:swapRequestId/read
 * @access  Private
 */
const markAsRead = async (req, res) => {
  try {
    const { swapRequestId } = req.params;

    // Check if user is involved in the swap request
    const swapRequest = await SwapRequest.findById(swapRequestId);
    if (!swapRequest) {
      return res.status(404).json({
        success: false,
        error: 'Swap request not found',
        message: 'Swap request not found'
      });
    }

    if (swapRequest.requester.toString() !== req.user.id && 
        swapRequest.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only mark as read messages from conversations you are involved in'
      });
    }

    // Mark messages as read
    const result = await Message.markAsRead(swapRequestId, req.user.id);

    res.status(200).json({
      success: true,
      data: {
        messagesMarked: result.modifiedCount
      },
      message: 'Messages marked as read successfully'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark messages as read',
      message: error.message
    });
  }
};

/**
 * @desc    Get unread message count
 * @route   GET /api/messages/unread-count
 * @access  Private
 */
const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.getUnreadCount(req.user.id);

    res.status(200).json({
      success: true,
      data: { unreadCount: count },
      message: 'Unread message count retrieved successfully'
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get unread count',
      message: error.message
    });
  }
};

/**
 * @desc    Delete message
 * @route   DELETE /api/messages/:id
 * @access  Private
 */
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found',
        message: 'Message not found'
      });
    }

    // Check if user is the sender
    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only delete messages you sent'
      });
    }

    // Soft delete the message
    const deletedMessage = await Message.deleteMessage(req.params.id, req.user.id);

    res.status(200).json({
      success: true,
      data: deletedMessage,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete message',
      message: error.message
    });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount,
  deleteMessage
};
