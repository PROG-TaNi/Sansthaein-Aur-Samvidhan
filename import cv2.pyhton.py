import cv2
import mediapipe as mp

# Initialize MediaPipe Hands
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(max_num_hands=1, min_detection_confidence=0.7)
mp_draw = mp.solutions.drawing_utils

# Function to count the number of raised fingers (ignoring thumb)
def count_fingers(landmarks):
    # Finger tips landmarks: Index (8), Middle (12), Ring (16), Pinky (20)
    fingers = []

    # Other four fingers (Ignore Thumb)
    for tip in [8, 12, 16, 20]:
        if landmarks[tip].y < landmarks[tip - 2].y:  # Check if tip is above the middle joint
            fingers.append(1)
        else:
            fingers.append(0)

    return fingers

# Initialize Video Capture
cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Flip the frame to avoid mirror image
    frame = cv2.flip(frame, 1)
    h, w, _ = frame.shape

    # Convert the frame to RGB for MediaPipe
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result = hands.process(rgb_frame)

    if result.multi_hand_landmarks:
        for hand_landmarks in result.multi_hand_landmarks:
            # Drawing hand landmarks on the frame
            mp_draw.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)

            # Counting fingers (without thumb)
            fingers = count_fingers(hand_landmarks.landmark)
            finger_count = sum(fingers)

            # Map finger counts to quiz options
            if finger_count == 1:
                option = "Option A"
            elif finger_count == 2:
                option = "Option B"
            elif finger_count == 3:
                option = "Option C"
            elif finger_count == 4:
                option = "Option D"
            else:
                option = "None"

            # Display the selected option
            cv2.putText(frame, f"Selected: {option}", (10, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

    # Display the frame
    cv2.imshow("Quiz Gesture Recognition", frame)

    # Break the loop on pressing 'q'
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release resources
cap.release()
cv2.destroyAllWindows()
