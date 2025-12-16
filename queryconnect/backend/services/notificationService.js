const Notification = require('../models/Notification');

// Helper function to create a notification
const createNotification = async (userId, type, title, message, ticketId = null) => {
  try {
    const notification = new Notification({
      user: userId,
      ticket: ticketId,
      type,
      title,
      message
    });
    await notification.save();
    console.log(`✅ Notification created for user ${userId}: ${title}`);
    return notification;
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    return null;
  }
};

// Notify when ticket is created (notify department members)
const notifyTicketCreated = async (ticket, student) => {
  try {
    const User = require('../models/User');
    
    // Get all department users
    const deptUsers = await User.find({ 
      role: 'department',
      department: ticket.department 
    });

    // Create notification for each department user
    const notifications = deptUsers.map(deptUser =>
      createNotification(
        deptUser._id,
        'ticket_created',
        'New Ticket Assigned',
        `New ticket "${ticket.title}" from ${student.name} (${student.department})`,
        ticket._id
      )
    );

    await Promise.all(notifications);
    console.log(`✅ ${deptUsers.length} department members notified`);
  } catch (error) {
    console.error('Error in notifyTicketCreated:', error);
  }
};

// Notify when ticket status changes (notify student)
const notifyStatusChanged = async (ticket, student, newStatus, changedBy) => {
  try {
    await createNotification(
      student._id,
      'status_changed',
      'Ticket Status Updated',
      `Your ticket "${ticket.title}" status changed to ${newStatus} by ${changedBy}`,
      ticket._id
    );
  } catch (error) {
    console.error('Error in notifyStatusChanged:', error);
  }
};

// Notify when comment is added (notify student)
const notifyCommentAdded = async (ticket, student, commentBy, commentText) => {
  try {
    // Truncate long comments
    const truncatedComment = commentText.length > 100 
      ? commentText.substring(0, 100) + '...' 
      : commentText;

    await createNotification(
      student._id,
      'comment_added',
      'New Comment on Your Ticket',
      `${commentBy} commented: "${truncatedComment}"`,
      ticket._id
    );
  } catch (error) {
    console.error('Error in notifyCommentAdded:', error);
  }
};

// Notify when ticket is reassigned
const notifyTicketReassigned = async (ticket, student, oldDept, newDept) => {
  try {
    const User = require('../models/User');
    
    // Notify student
    await createNotification(
      student._id,
      'ticket_reassigned',
      'Ticket Reassigned',
      `Your ticket "${ticket.title}" was reassigned from ${oldDept} to ${newDept}`,
      ticket._id
    );

    // Notify new department members
    const newDeptUsers = await User.find({ 
      role: 'department',
      department: newDept 
    });

    const notifications = newDeptUsers.map(deptUser =>
      createNotification(
        deptUser._id,
        'ticket_reassigned',
        'Ticket Reassigned to Your Department',
        `Ticket "${ticket.title}" from ${student.name} reassigned to ${newDept}`,
        ticket._id
      )
    );

    await Promise.all(notifications);
    console.log(`✅ Student and ${newDeptUsers.length} new department members notified`);
  } catch (error) {
    console.error('Error in notifyTicketReassigned:', error);
  }
};

// Send custom notification (admin manual send)
const sendCustomNotification = async (userIds, title, message, ticketId = null) => {
  try {
    const notifications = userIds.map(userId =>
      createNotification(userId, 'custom', title, message, ticketId)
    );
    await Promise.all(notifications);
    console.log(`✅ Custom notification sent to ${userIds.length} users`);
    return { success: true, count: userIds.length };
  } catch (error) {
    console.error('Error in sendCustomNotification:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  createNotification,
  notifyTicketCreated,
  notifyStatusChanged,
  notifyCommentAdded,
  notifyTicketReassigned,
  sendCustomNotification
};