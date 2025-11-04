# Phase 2: Steps 1-2 (Basic Info & Struggle Assessment)

## Goal
Add the first two interactive forms with data collection

## Prerequisites
- Phase 1 must be complete (navigation system working)

## Deliverables

- **Step 1:** Name input field with validation
- **Step 2:** Likert scale (1-5) for "Is lust a current struggle?"
- Store responses in JavaScript object
- Enable "Next" only when fields are valid
- Add smooth focus animations

## Technical Specifications

### Step 1: Basic Information

**Prompt Text:**
"Let's start with the basics. What's your name?"

**Form Element:**
- Single text input field
- Placeholder: "Enter your name"
- Required validation (minimum 2 characters, no numbers)
- Real-time validation feedback
- Auto-focus on step entry

**Validation Rules:**
- Minimum 2 characters
- Maximum 50 characters
- Only letters, spaces, and hyphens allowed
- Trim whitespace

**Visual Feedback:**
- Green checkmark when valid
- Red error message if invalid
- Disable "Next" button until valid

### Step 2: Struggle Assessment

**Prompt Text:**
"Is lust a current struggle in your life?"

**Likert Scale:**
- 5 radio buttons or clickable options
- Labels:
  1. Strongly Disagree
  2. Disagree
  3. Neutral
  4. Agree
  5. Strongly Agree
- Visual representation (can use emoji, numbers, or descriptive labels)
- Selected state clearly visible

**UI Options:**
- Option A: Horizontal row of 5 buttons
- Option B: Vertical list of radio buttons
- Option C: Slider/scale with labels

**Validation:**
- At least one option must be selected
- Store numeric value (1-5)

### Data Storage

**JavaScript Object Structure:**
```javascript
const userData = {
  step1: {
    name: ""
  },
  step2: {
    struggleRating: null // 1-5
  }
}
```

**Functions Needed:**
- `validateStep1()` - Check name field
- `validateStep2()` - Check if rating selected
- `saveStepData(stepNumber, data)` - Store in userData object
- `canProceedToNext()` - Check if current step is valid

### Animations
- Input focus glow effect
- Smooth transition when validation state changes
- Button hover effects
- Selected state animation for Likert scale

## What You'll Have
Users can enter name and rate their struggle level. Data is stored and validated before proceeding.

## Testing Checklist
- [ ] Name field accepts valid input and rejects invalid
- [ ] Likert scale allows selection and shows selected state
- [ ] "Next" button disabled until both steps are valid
- [ ] Data is stored correctly in userData object
- [ ] Back button returns to previous step with data preserved
- [ ] Mobile-friendly touch interactions
- [ ] Accessible (screen reader support)

## Next Phase
Once Phase 2 is complete and tested, proceed to Phase 3: Step 3 (Audio Recording)
