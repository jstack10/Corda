# Phase 5: Step 5 (User Reflection)

## Goal
Collect user's emotional response to the AI-generated message

## Prerequisites
- Phase 1 complete (navigation system)
- Phase 2 complete (forms)
- Phase 3 complete (audio recording)
- Phase 4 complete (AI response generation)

## Deliverables

- Three reflection prompts with text areas:
  - "What would you say to that person?"
  - "How do you feel listening to this?"
  - "How would you want to help them?"
- Character counter for each field
- Store reflection responses

## Technical Specifications

### Step 5: Reflection Prompts

**Header Text:**
"Now, take a moment to reflect..."

**Layout:**
- Three separate text areas, displayed one at a time or all at once
- Each with its own prompt/question
- Generous spacing between fields

### Prompt 1: Direct Response

**Question:**
"What would you say to that person?"

**Context Note (optional subtitle):**
"The younger version of you who first experienced this"

**Text Area:**
- Multi-line text input (textarea)
- Minimum 3 rows, expands as needed
- Placeholder: "Share what you would want them to know..."
- Character limit: 500 characters (or unlimited, your choice)

**Character Counter:**
- Display: "X / 500 characters" (if limited)
- Changes color when approaching limit (yellow at 80%, red at 90%)

### Prompt 2: Emotional Response

**Question:**
"How do you feel listening to this?"

**Sub-prompt (optional):**
"What emotions come up as you hear this response to your story?"

**Text Area:**
- Multi-line text input
- Placeholder: "Describe your feelings..."
- Character limit: 500 characters (or unlimited)

**Character Counter:**
- Same as above

### Prompt 3: Helping Intention

**Question:**
"How would you want to help them?"

**Sub-prompt (optional):**
"What support would you offer to that younger version of yourself?"

**Text Area:**
- Multi-line text input
- Placeholder: "Share how you'd want to support them..."
- Character limit: 500 characters (or unlimited)

**Character Counter:**
- Same as above

### UI/UX Design

**Display Options:**

**Option A: All at Once (Recommended)**
- All three prompts visible on one scrollable page
- User can fill them in any order
- Clear visual separation between sections

**Option B: One at a Time**
- Each prompt appears sequentially
- "Next" to reveal next prompt
- Creates more focused experience but adds clicks

**Visual Design:**
- Clean, spacious layout
- Large, readable text areas
- Subtle borders or backgrounds to distinguish sections
- Smooth focus animations
- Auto-save as user types (store in userData)

**Validation:**
- Optional: Minimum character requirement (e.g., 20 chars per field)
- Or: Allow empty fields (some users may not have much to say)
- Your choice based on therapeutic goals

### Data Storage

**Update userData object:**
```javascript
userData.step5 = {
  directResponse: "",      // What they'd say
  emotionalResponse: "",   // How they feel
  helpingIntention: "",    // How they'd help
  timestamp: null          // When completed
}
```

**Auto-save:**
- Save responses as user types (debounced, every 2-3 seconds)
- Preserve data if user navigates back and returns

**Functions Needed:**
- `updateCharacterCount(textarea, counter)` - Update character display
- `validateReflectionForm()` - Check if all fields filled (if required)
- `saveReflectionData()` - Store in userData
- `loadReflectionData()` - Restore if user returns to step

### Interaction Flow

1. User sees Step 5 header and all three prompts
2. User fills in responses (can do in any order)
3. Character counters update in real-time
4. Data auto-saves as they type
5. "Next" button enabled (either immediately or after minimum characters)
6. User can review/edit before proceeding

### Accessibility

- Labels properly associated with textareas
- Keyboard navigation works smoothly
- Screen reader announces character counts
- Focus indicators clearly visible
- Sufficient color contrast

## What You'll Have
Users can process and respond to their own story from a new perspective. They articulate what they'd say to their younger self, how they feel, and how they'd help.

## Testing Checklist
- [ ] All three text areas are functional
- [ ] Character counters update accurately
- [ ] Character limit enforced (if set)
- [ ] Data saves as user types
- [ ] Data persists when navigating back/forward
- [ ] Layout is clean and readable
- [ ] Works well on mobile (keyboard doesn't cover fields)
- [ ] Auto-save doesn't cause performance issues
- [ ] Form validation works (if minimum characters required)
- [ ] "Next" button state updates correctly
- [ ] Accessible for screen readers

## Therapeutic Considerations
- These prompts encourage self-compassion
- Allow users to take their time
- Consider adding "Skip for now" option if helpful
- Ensure privacy messaging is clear

## Next Phase
Once Phase 5 is complete and tested, proceed to Phase 6: Step 6 (Expert Review Consent)
