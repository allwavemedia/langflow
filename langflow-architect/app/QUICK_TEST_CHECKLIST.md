# Quick Test Checklist - Langflow Architect

## 🚀 5-Minute Quick Test

**Start Here:** Make sure the app is running at `http://localhost:3000`

### Test 1: Basic Functionality (2 minutes)
**Question to ask:**
```
I need help building a patient management system for a small clinic
```

**✅ Success if you see:**
- Response mentions healthcare/medical terms
- AI asks specific questions about patient data, compliance, or medical workflows
- Response arrives within 10 seconds

**📝 Report format:**
```
Test 1 Result: PASS/FAIL
Response time: X seconds
Key questions asked: [list 2-3 questions the AI asked]
Any issues: [describe any problems]
```

---

### Test 2: Expertise Detection (2 minutes)
**Question to ask:**
```
I'm completely new to technology and want to build something simple
```

**✅ Success if you see:**
- Simple, beginner-friendly language
- Basic questions without technical jargon
- Helpful, encouraging tone

**📝 Report format:**
```
Test 2 Result: PASS/FAIL
Language level: Beginner-friendly/Too technical
Tone: Helpful/Confusing
Any issues: [describe any problems]
```

---

### Test 3: Follow-up Adaptation (1 minute)
**Follow up your previous answer with:**
```
Actually, I have some programming experience with Python and databases
```

**✅ Success if you see:**
- AI adjusts questions to be more technical
- References your Python/database experience
- Questions become more specific

**📝 Report format:**
```
Test 3 Result: PASS/FAIL
Adaptation: AI adjusted/Didn't adjust
Context retention: Good/Poor
Any issues: [describe any problems]
```

---

## 📊 Report Your Results

**Copy this template and fill it out:**

```
=== QUICK TEST RESULTS ===
Date: [today's date]
Browser: [Chrome/Firefox/Safari/Edge]
Time: [how long testing took]

Test 1 (Healthcare): PASS/FAIL
- Response time: X seconds
- Questions quality: Good/Fair/Poor
- Issues: [any problems]

Test 2 (Beginner): PASS/FAIL  
- Language appropriate: Yes/No
- Tone helpful: Yes/No
- Issues: [any problems]

Test 3 (Adaptation): PASS/FAIL
- AI adapted: Yes/No
- Context retained: Yes/No  
- Issues: [any problems]

Overall Assessment: Good/Fair/Poor
Critical issues found: Yes/No - [describe if yes]
Ready for more detailed testing: Yes/No
```

---

## 🔧 Troubleshooting

**App won't load?**
- Check if `npm run dev` is running in terminal
- Try refreshing browser
- Clear browser cache

**No response from AI?**
- Wait 30 seconds
- Check browser console (F12) for errors
- Try a different browser

**Weird responses?**
- Note exact question that caused issue
- Include this in your report

---

## ▶️ Next Steps

After quick testing:
1. **If tests mostly PASS:** Proceed with full manual testing guide
2. **If tests FAIL:** Report issues immediately for debugging
3. **If mixed results:** Run a few more quick tests to identify patterns

**For comprehensive testing:** Use the full `MANUAL_TESTING_GUIDE.md`
