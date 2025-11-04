# Phase 3: Step 3 (Audio Recording)

## Goal
Implement audio recording with Web Audio API

## Prerequisites
- Phase 1 complete (navigation system)
- Phase 2 complete (forms working)

## Deliverables

- Audio recording interface with Record/Stop/Play buttons
- Visual waveform or recording indicator
- Microphone permissions handling
- Store audio as Blob in memory
- Add re-record functionality
- "Tell your story - it matters" prompts

## Technical Specifications

### Step 3: Story Recording

**Prompt Text:**
"Describe the first time you experienced this problem."

**Sub-prompt:**
"Tell your story - it matters"

**Guiding Questions (Display before recording):**
- How old were you?
- Where were you?
- Who was around?
- How did you feel during and after?

### Audio Recording Interface

**Controls:**
1. **Record Button**
   - Red circular button with microphone icon
   - Text: "Start Recording"
   - Changes to "Recording..." when active
   - Shows recording timer (MM:SS format)

2. **Stop Button** (appears during recording)
   - Square button with stop icon
   - Text: "Stop Recording"
   - Saves the recording

3. **Play Button** (appears after recording)
   - Circular button with play icon
   - Text: "Play Recording"
   - Allows user to review their recording
   - Shows duration while playing

4. **Re-record Button** (appears after recording)
   - Secondary button
   - Text: "Record Again"
   - Clears current recording and starts new one

### Visual Feedback

**During Recording:**
- Animated waveform visualization (if possible)
- Or pulsing red indicator/circle
- Recording timer display
- Visual indicator that microphone is active

**After Recording:**
- Waveform visualization of recorded audio
- Duration display
- Audio player with progress bar

### Technical Implementation

**Web APIs Used:**
- `navigator.mediaDevices.getUserMedia()` - Access microphone
- `MediaRecorder API` - Record audio
- `AudioContext` - Playback and visualization (optional)

**Audio Format:**
- Preferred: WebM (widely supported)
- Fallback: OGG or WAV
- Store as Blob object in memory

**Error Handling:**
- Microphone permission denied → Show friendly message
- No microphone available → Show error message
- Browser not supported → Fallback message
- Recording errors → Retry option

### Data Storage

**Update userData object:**
```javascript
userData.step3 = {
  audioBlob: null, // Blob object
  audioUrl: null,  // Object URL for playback
  duration: null,  // in seconds
  timestamp: null  // when recorded
}
```

**Functions Needed:**
- `requestMicrophonePermission()` - Request access
- `startRecording()` - Begin audio capture
- `stopRecording()` - End and save recording
- `playRecording()` - Play back audio
- `deleteRecording()` - Clear current recording
- `formatTime(seconds)` - Format timer display

### UX Flow

1. User sees prompt and guiding questions
2. Click "Start Recording"
3. Browser requests microphone permission (if first time)
4. Recording starts, timer begins, visual feedback shows
5. User clicks "Stop Recording" when done
6. Recording is saved and play button appears
7. User can play to review
8. User can re-record if not satisfied
9. "Next" button enabled once recording exists

## What You'll Have
Users can record and review their audio story before proceeding. Audio is stored in memory as a Blob.

## Testing Checklist
- [ ] Microphone permission request works
- [ ] Recording starts and stops correctly
- [ ] Audio playback works
- [ ] Re-record functionality clears previous recording
- [ ] Timer displays accurately
- [ ] Visual feedback works (waveform or indicator)
- [ ] Error handling for denied permissions
- [ ] Works on mobile browsers (iOS Safari, Chrome)
- [ ] Audio quality is acceptable
- [ ] "Next" button only enabled after recording exists
- [ ] Data stored correctly in userData object

## Browser Compatibility Notes
- iOS Safari: Requires HTTPS or localhost for getUserMedia
- Chrome: Full support
- Firefox: Full support
- Edge: Full support

## Next Phase
Once Phase 3 is complete and tested, proceed to Phase 4: Step 4 (AI Response Generation)
