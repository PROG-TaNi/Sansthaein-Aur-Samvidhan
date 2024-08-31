import cv2
import mediapipe as mp
import pyautogui
import math
import time

# Initialize MediaPipe hands
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(max_num_hands=1, min_detection_confidence=0.7, min_tracking_confidence=0.7)
mp_drawing = mp.solutions.drawing_utils

# Get screen size
screen_width, screen_height = pyautogui.size()

# Function to move the mouse with increased speed
def move_mouse(x, y):
    # Clamp coordinates to screen size to avoid out-of-bound errors
    x = max(0, min(screen_width - 1, x))
    y = max(0, min(screen_height - 1, y))
    
    # Increase mouse movement speed by adjusting speed_factor
    speed_factor = 2  # Adjust this factor to control the speed of the mouse
    x_moved = x * speed_factor
    y_moved = y * speed_factor
    
    # Clamp moved coordinates to screen size
    x_moved = max(0, min(screen_width - 1, x_moved))
    y_moved = max(0, min(screen_height - 1, y_moved))
    
    pyautogui.moveTo(x_moved, y_moved, duration=0.1)

# Function to left-click the mouse
def left_click_mouse():
    pyautogui.click()

# Function to right-click the mouse
def right_click_mouse():
    pyautogui.rightClick()

# Function to press and hold the mouse button
def press_and_hold_mouse():
    pyautogui.mouseDown()

# Function to release the mouse button
def release_mouse():
    pyautogui.mouseUp()

# Initialize timer variables
press_and_hold_start_time = None

# Start video capture
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Error: Could not open camera.")
    exit()

while cap.isOpened():
    success, frame = cap.read()
    if not success:
        print("Ignoring empty camera frame.")
        continue
 
    # Flip the frame horizontally for a mirror effect
    frame = cv2.flip(frame, 1)

    # Convert the BGR image to RGB
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # Process the frame and detect hands
    results = hands.process(frame_rgb)

    # Draw hand annotations on the frame
    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            mp_drawing.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
            
            # Get the index finger tip, middle finger tip, ring finger tip, pinky finger tip, and thumb tip landmarks
            index_finger_tip = hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP]
            middle_finger_tip = hand_landmarks.landmark[mp_hands.HandLandmark.MIDDLE_FINGER_TIP]
            ring_finger_tip = hand_landmarks.landmark[mp_hands.HandLandmark.RING_FINGER_TIP]
            pinky_tip = hand_landmarks.landmark[mp_hands.HandLandmark.PINKY_TIP]
            thumb_tip = hand_landmarks.landmark[mp_hands.HandLandmark.THUMB_TIP]
 
            # Convert the landmark coordinates to screen coordinates
            x_index = int(index_finger_tip.x * screen_width)
            y_index = int(index_finger_tip.y * screen_height)
            x_middle = int(middle_finger_tip.x * screen_width)
            y_middle = int(middle_finger_tip.y * screen_height)
            x_ring = int(ring_finger_tip.x * screen_width)
            y_ring = int(ring_finger_tip.y * screen_height)
            x_pinky = int(pinky_tip.x * screen_width)
            y_pinky = int(pinky_tip.y * screen_height)
            x_thumb = int(thumb_tip.x * screen_width)
            y_thumb = int(thumb_tip.y * screen_height)
            
            # Move the mouse pointer using the index finger with increased speed
            move_mouse(x_index, y_index)

            # Calculate the distance between thumb and middle finger
            distance_middle_thumb = math.hypot(x_middle - x_thumb, y_middle - y_thumb)
            
            # Calculate the distance between thumb and ring finger
            distance_ring_thumb = math.hypot(x_ring - x_thumb, y_ring - y_thumb)
            
            # Calculate the distance between thumb and pinky
            distance_pinky_thumb = math.hypot(x_pinky - x_thumb, y_pinky - y_thumb)

            # Perform left-click if thumb and middle finger are pinched
            if distance_middle_thumb < 40:  # Adjust the threshold based on your preference
                left_click_mouse()
            
            # Perform right-click if thumb and ring finger are pinched
            if distance_ring_thumb < 40:  # Adjust the threshold based on your preference
                right_click_mouse()
            
            # Detect pinch between index and thumb for press and hold
            distance_index_thumb = math.hypot(x_index - x_thumb, y_index - y_thumb)

            if distance_index_thumb < 40:  # Adjust the threshold based on your preference
                if press_and_hold_start_time is None:
                    press_and_hold_start_time = time.time()
                elif time.time() - press_and_hold_start_time >= 2:  # 2 seconds threshold
                    press_and_hold_mouse()
            else:
                if press_and_hold_start_time is not None:
                    release_mouse()
                    press_and_hold_start_time = None

    # Display the frame
    cv2.imshow('Hand Gesture Mouse Control', frame)

    # Break the loop on pressing 'q'
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release resources 
cap.release()
cv2.destroyAllWindows()
hands.close()




