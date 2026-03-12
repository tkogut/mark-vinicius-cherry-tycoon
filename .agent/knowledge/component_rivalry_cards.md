# Component Spec: Mechanical Rivalry Cards
**Visual Reference**: image_aadc9e.jpg (Brass Filigree & Mahogany Tiles)
**Function**: AI Rival Presence & Auction Feedback

## 1. Visual Engineering
* **Foundation**: Small, etched brass plates with a mahogany wood inlay.
* **Portraits**: High-contrast, sepia-toned portraits of Marek, Kasia, or Hans, appearing as if "stamped" into the brass.
* **Mechanical Slots**: The cards reside in mechanical "slots" at the top of the UI. When an AI is active, the card "slides" forward with a metallic clink.

## 2. Dynamic Interactions (Juice)
* **Outbid Reaction**: When an AI outbids the player, the card must:
    1.  **Vibrate** aggressively using CSS keyframes.
    2.  **Emit Steam**: Trigger a Lottie/Canvas particle effect (white steam puffs) from the sides.
    3.  **Glow**: The brass edges should flash a warning red light.
* **Defeat State**: When the player wins, the AI card "retracts" back into the dashboard with a steam hiss.

## 3. Mobile Tactile Integration
* **Location**: Top 20% of the screen, away from the "Thumb Zone" but clearly visible.
* **Feedback**: A distinct haptic pulse should trigger on the phone whenever a card "slides" or "vibrates".