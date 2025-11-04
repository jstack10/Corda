# Phase 6: Step 6 (Expert Review Consent)

## Goal
Final consent form and data submission simulation

## Prerequisites
- All previous phases complete (Phases 1-5)

## Deliverables

- Consent message explaining expert review process
- Checkbox: "I consent to share my responses for expert review"
- Submit button (can mock API call for now)
- Thank you screen with next steps
- Optional: Download user's complete journey as JSON/PDF

## Technical Specifications

### Step 6: Expert Review Consent

**Header Text:**
"Thank you for sharing your story"

**Consent Message:**
```
"Would you like to submit your response to be reviewed by experts to gain more 
perspective on you and how you can make progress in your own life while helping others?

Our team of trained professionals can provide personalized insights and guidance 
based on your journey. Your responses will be kept confidential and reviewed with 
care and compassion."
```

**Consent Checkbox:**
- Large, accessible checkbox
- Label: "I consent to share my responses for expert review"
- Required to proceed to submission
- Clear privacy/confidentiality note nearby

### Submission Flow

**Submit Button:**
- Primary action button
- Text: "Submit for Expert Review" or "I'm Ready"
- Disabled until checkbox is checked
- Shows loading state when clicked

**Loading State:**
- "Submitting your response..."
- Spinner or progress indicator
- Brief delay (2-3 seconds) to simulate processing

**Success State:**
- Thank you message appears
- Confirmation that submission was received

### Thank You Screen

**Main Message:**
```
"Thank You

Your response has been received. Our team will review your story and provide 
personalized insights to help you make progress in this area while also helping 
others who share similar experiences.

You should hear from us within [timeframe, e.g., 3-5 business days]."
```

**Next Steps (Optional):**
- Email confirmation (if email collected)
- Reference number for tracking
- Link to resources or support
- Option to start a new journey

**Actions:**
- "Download My Journey" button (optional) - Downloads JSON/PDF
- "Return Home" button - Goes back to main app page
- "Start New Journey" button (optional) - Resets and starts over

### Data Submission

**For MVP (Mock Submission):**
```javascript
function submitForReview(userData) {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Submitted data:', userData);
      // In real app, this would POST to backend API
      resolve({ success: true, referenceId: generateReferenceId() });
    }, 2000);
  });
}
```

**Data Structure to Submit:**
```javascript
const submissionData = {
  timestamp: new Date().toISOString(),
  userInfo: userData.step1,
  struggleRating: userData.step2,
  audioRecording: userData.step3.audioBlob, // May need to convert to base64
  transcription: userData.step4.transcription,
  aiResponse: userData.step4.responseText,
  reflections: userData.step5,
  consentGiven: true,
  consentTimestamp: new Date().toISOString()
}
```

**Real Implementation (Future):**
- POST to backend API endpoint
- Handle errors (network failures, etc.)
- Retry mechanism
- Receipt confirmation

### Download Journey Feature (Optional)

**JSON Download:**
```javascript
function downloadJSON(userData) {
  const dataStr = JSON.stringify(userData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `my-journey-${Date.now()}.json`;
  link.click();
}
```

**PDF Download (Advanced, Optional):**
- Use library like jsPDF or html2pdf
- Format user's complete journey nicely
- Include all steps, responses, and timestamps

### Privacy & Security

**Important Notes to Display:**
- Data is encrypted in transit
- Responses are confidential
- Only authorized experts will review
- Data can be deleted upon request (if applicable)
- Link to privacy policy (if you have one)

### Data Storage

**Update userData object:**
```javascript
userData.step6 = {
  consentGiven: false,
  submitted: false,
  submissionTimestamp: null,
  referenceId: null // If generated
}
```

**Functions Needed:**
- `handleConsentChange(checked)` - Update consent state
- `validateConsent()` - Check if consent given
- `submitForReview(userData)` - Send data (mock or real)
- `showThankYouScreen()` - Display success message
- `downloadJourney(userData)` - Generate download (optional)
- `resetJourney()` - Clear all data for new journey (optional)

### UX Flow

1. User sees Step 6 with consent message
2. User reads explanation about expert review
3. User checks consent checkbox
4. Submit button becomes enabled
5. User clicks "Submit for Expert Review"
6. Loading state shows briefly
7. Thank you screen appears
8. User can download journey or return home

### Error Handling

- If submission fails: Show error message with retry option
- Network errors: Friendly message, save locally for later
- Validation errors: Ensure consent is checked

## What You'll Have
Complete flow from start to finish with consent mechanism. Users can submit their journey for expert review and receive confirmation.

## Testing Checklist
- [ ] Consent checkbox works and enables submit button
- [ ] Submit button disabled until consent given
- [ ] Loading state shows during submission
- [ ] Thank you screen appears after submission
- [ ] All user data is included in submission (check console.log)
- [ ] Download journey works (if implemented)
- [ ] Error handling works (test with network disabled)
- [ ] Privacy messaging is clear
- [ ] Works on mobile devices
- [ ] Accessible (keyboard navigation, screen readers)

## Future Enhancements
- Real backend API integration
- Email notifications
- Expert dashboard to review submissions
- User portal to view responses
- Analytics on journey completion rates
- Reminder emails for follow-up

## Project Complete!
Once Phase 6 is complete, you have a fully functional therapeutic audio journey app ready for user testing and refinement.
