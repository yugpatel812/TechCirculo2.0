package org.yug.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;

@Controller
@CrossOrigin(origins = "*")
public class WebSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/points.update")
    @SendTo("/topic/points")
    public PointsUpdateMessage handlePointsUpdate(@Payload PointsUpdateMessage message) {
        return message;
    }

    @MessageMapping("/points.private")
    @SendToUser("/queue/points")
    public PointsUpdateMessage handlePrivatePointsUpdate(@Payload PointsUpdateMessage message) {
        return message;
    }

    // Method to send real-time updates from service layer
    public void sendPointsUpdate(String username, int newTotal, int pointsAwarded, String reason, String badgeAwarded) {
        PointsUpdateMessage message = new PointsUpdateMessage();
        message.setUsername(username);
        message.setNewTotalPoints(newTotal);
        message.setPointsAwarded(pointsAwarded);
        message.setReason(reason);
        message.setBadgeAwarded(badgeAwarded);
        message.setTimestamp(System.currentTimeMillis());

        // Send to specific user
        messagingTemplate.convertAndSendToUser(username, "/queue/points", message);
        
        // Also broadcast to all users for leaderboard updates
        messagingTemplate.convertAndSend("/topic/points", message);
    }

    public static class PointsUpdateMessage {
        private String username;
        private int newTotalPoints;
        private int pointsAwarded;
        private String reason;
        private String badgeAwarded;
        private long timestamp;

        // Constructors
        public PointsUpdateMessage() {}

        public PointsUpdateMessage(String username, int newTotalPoints, int pointsAwarded, String reason) {
            this.username = username;
            this.newTotalPoints = newTotalPoints;
            this.pointsAwarded = pointsAwarded;
            this.reason = reason;
            this.timestamp = System.currentTimeMillis();
        }

        // Getters and Setters
        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public int getNewTotalPoints() {
            return newTotalPoints;
        }

        public void setNewTotalPoints(int newTotalPoints) {
            this.newTotalPoints = newTotalPoints;
        }

        public int getPointsAwarded() {
            return pointsAwarded;
        }

        public void setPointsAwarded(int pointsAwarded) {
            this.pointsAwarded = pointsAwarded;
        }

        public String getReason() {
            return reason;
        }

        public void setReason(String reason) {
            this.reason = reason;
        }

        public String getBadgeAwarded() {
            return badgeAwarded;
        }

        public void setBadgeAwarded(String badgeAwarded) {
            this.badgeAwarded = badgeAwarded;
        }

        public long getTimestamp() {
            return timestamp;
        }

        public void setTimestamp(long timestamp) {
            this.timestamp = timestamp;
        }
    }
}