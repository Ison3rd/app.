/**
 * AnimatorChat Integration Guide
 * How to embed the chat app into AnimeVerse Empire
 */

// 1. Add Chat Button to Main Dashboard Sidebar
function addChatToSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const chatNavItem = document.createElement('div');
    chatNavItem.className = 'nav-item';
    chatNavItem.innerHTML = `
        <i class="fas fa-comments"></i> AnimatorChat
        <span class="notification-badge">5</span>
    `;
    chatNavItem.addEventListener('click', openAnimatorChat);
    
    // Insert after "Team Management" nav item
    const teamManagementItem = document.querySelector('.nav-item:nth-child(4)');
    teamManagementItem.insertAdjacentElement('afterend', chatNavItem);
}

// 2. Open Chat in Modal/Overlay
function openAnimatorChat() {
    const chatModal = document.createElement('div');
    chatModal.className = 'chat-modal';
    chatModal.innerHTML = `
        <div class="chat-modal-content">
            <div class="chat-modal-header">
                <h3>AnimatorChat</h3>
                <button class="close-chat-modal">&times;</button>
            </div>
            <iframe src="animator-chat.html" width="100%" height="600px" frameborder="0"></iframe>
        </div>
    `;
    
    document.body.appendChild(chatModal);
    
    // Close modal functionality
    chatModal.querySelector('.close-chat-modal').addEventListener('click', () => {
        document.body.removeChild(chatModal);
    });
}

// 3. CSS for Chat Modal Integration
const chatModalStyles = `
    .chat-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(5px);
    }
    
    .chat-modal-content {
        background: white;
        border-radius: 20px;
        overflow: hidden;
        width: 90%;
        max-width: 1200px;
        height: 80%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    
    .chat-modal-header {
        padding: 20px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .close-chat-modal {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background 0.3s ease;
    }
    
    .close-chat-modal:hover {
        background: rgba(255, 255, 255, 0.2);
    }
    
    .notification-badge {
        background: var(--secondary);
        color: white;
        font-size: 12px;
        padding: 2px 6px;
        border-radius: 10px;
        margin-left: 10px;
    }
`;

// 4. Initialize Chat Integration
function initializeChatIntegration() {
    // Add styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = chatModalStyles;
    document.head.appendChild(styleSheet);
    
    // Add chat to sidebar
    addChatToSidebar();
    
    // Set up message passing between frames
    setupMessagePassing();
}

// 5. Message Passing Between Main App and Chat
function setupMessagePassing() {
    window.addEventListener('message', (event) => {
        if (event.data.type === 'chat-notification') {
            updateChatNotifications(event.data.count);
        }
        
        if (event.data.type === 'user-info-request') {
            // Send user info to chat
            const userInfo = {
                name: document.querySelector('.user-name').textContent,
                role: document.querySelector('.user-role').textContent,
                avatar: document.querySelector('.user-avatar').textContent,
                userId: localStorage.getItem('userId') || '1234'
            };
            
            event.source.postMessage({
                type: 'user-info-response',
                data: userInfo
            }, '*');
        }
    });
}

// 6. Update Chat Notifications
function updateChatNotifications(count) {
    const notificationBadge = document.querySelector('.nav-item .notification-badge');
    if (notificationBadge) {
        notificationBadge.textContent = count;
        notificationBadge.style.display = count > 0 ? 'inline' : 'none';
    }
}

// 7. Alternative: Embed Chat as Panel
function embedChatAsPanel() {
    const mainContent = document.querySelector('.main-content');
    const chatPanel = document.createElement('div');
    chatPanel.className = 'chat-panel';
    chatPanel.innerHTML = `
        <div class="chat-panel-header">
            <h3>Team Chat</h3>
            <button class="expand-chat-btn">
                <i class="fas fa-expand"></i>
            </button>
        </div>
        <iframe src="animator-chat.html" width="100%" height="400px" frameborder="0"></iframe>
    `;
    
    // Add to right column
    const rightColumn = document.querySelector('.right-column');
    rightColumn.appendChild(chatPanel);
    
    // Expand functionality
    chatPanel.querySelector('.expand-chat-btn').addEventListener('click', openAnimatorChat);
}

// 8. Chat Panel Styles
const chatPanelStyles = `
    .chat-panel {
        background: var(--card-bg);
        border: 1px solid var(--card-border);
        border-radius: 20px;
        overflow: hidden;
        margin-bottom: 25px;
    }
    
    .chat-panel-header {
        padding: 15px 20px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .expand-chat-btn {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 16px;
        padding: 5px;
        border-radius: 5px;
        transition: background 0.3s ease;
    }
    
    .expand-chat-btn:hover {
        background: rgba(255, 255, 255, 0.2);
    }
`;

// 9. Project-Specific Chat Integration
function linkChatToProject(projectId) {
    const chatFrame = document.querySelector('iframe[src*="animator-chat.html"]');
    if (chatFrame) {
        chatFrame.contentWindow.postMessage({
            type: 'switch-project-chat',
            projectId: projectId
        }, '*');
    }
}

// 10. Real-time Notifications Integration
function setupRealTimeNotifications() {
    // Simulate WebSocket connection
    const socket = {
        onmessage: function(event) {
            const data = JSON.parse(event.data);
            if (data.type === 'new-message') {
                showChatNotification(data.message, data.sender);
            }
        }
    };
    
    return socket;
}

function showChatNotification(message, sender) {
    const notification = document.createElement('div');
    notification.className = 'chat-notification';
    notification.innerHTML = `
        <div class="notification-avatar">${sender.charAt(0)}</div>
        <div class="notification-content">
            <div class="notification-sender">${sender}</div>
            <div class="notification-message">${message}</div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

// 11. Usage Examples
document.addEventListener('DOMContentLoaded', function() {
    // Initialize chat integration
    initializeChatIntegration();
    
    // Alternative: Embed as panel instead of modal
    // embedChatAsPanel();
    
    // Setup real-time notifications
    setupRealTimeNotifications();
    
    // Link chat to current project when project changes
    document.querySelectorAll('.project-item').forEach(item => {
        item.addEventListener('click', function() {
            const projectId = this.getAttribute('data-project-id');
            linkChatToProject(projectId);
        });
    });
});

// 12. Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeChatIntegration,
        embedChatAsPanel,
        linkChatToProject,
        updateChatNotifications
    };
}

/**
 * IMPLEMENTATION INSTRUCTIONS:
 * 
 * 1. Add this script to your main AnimeVerse Empire HTML file
 * 2. Ensure animator-chat.html is in the same directory
 * 3. The chat will automatically integrate with the existing UI
 * 4. Users can access chat via the sidebar or embedded panel
 * 5. Real-time notifications will appear for new messages
 * 
 * CUSTOMIZATION OPTIONS:
 * - Change modal size by adjusting .chat-modal-content CSS
 * - Modify notification styles in the chatModalStyles
 * - Add custom project-specific chat channels
 * - Integrate with existing WebSocket connections
 */