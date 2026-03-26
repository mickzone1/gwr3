# 🎵 Lyrics Configuration Guide

## Current Song: 良師頌 (Ode to Teachers)

### Traditional Chinese Lyrics (繁體中文)
```
良師啊
是您一顆
愛心關懷
燃亮了我
```

### English/Jyutping Lyrics
```
loeng si aa
si nei jat fo
oi sam gwaan waai
jin loeng liu ngo
```

---

## How to Adjust Lyrics Timing

### Step 1: Play Your Audio File
Open your audio file in a media player that shows timestamps (like VLC, Audacity, or online audio editor).

### Step 2: Note Timestamps for Each Line
Write down the exact time (in seconds) when each line should appear:

| Line | Chinese | English | Timestamp (ms) |
|------|---------|---------|----------------|
| 1 | 良師啊 | loeng si aa | 12000 |
| 2 | 是您一顆 | si nei jat fo | 16000 |
| 3 | 愛心關懷 | oi sam gwaan waai | 20000 |
| 4 | 燃亮了我 | jin loeng liu ngo | 24000 |

### Step 3: Update index.html

Find the `LYRICS_CHINESE` and `LYRICS_ENGLISH` arrays and update the `time` values:

```javascript
const LYRICS_CHINESE = [
    { time: 0, text: "🏆 良師頌 " },
    { time: 3000, text: "EdUHK 吉尼斯世界紀錄挑戰" },
    { time: 6000, text: "" },
    { time: 8000, text: "🎤 準備好了嗎？🎤" },
    { time: 11000, text: "" },
    { time: 12000, text: "良師啊" },          // ← Adjust this
    { time: 16000, text: "是您一顆" },        // ← Adjust this
    { time: 20000, text: "愛心關懷" },        // ← Adjust this
    { time: 24000, text: "燃亮了我" },        // ← Adjust this
    // ... continue for all lines
];
```

### Step 4: Test
1. Open the app in your browser
2. Select your language (Chinese or English)
3. Click "Record" and verify lyrics sync with audio
4. Adjust timestamps as needed

---

## Tips for Perfect Sync

1. **Convert seconds to milliseconds**: `seconds × 1000 = milliseconds`
   - Example: 12 seconds = 12000 ms

2. **Leave gaps between verses**: Add empty lines `{ time: 28000, text: "" }`

3. **Repeat structure**: If the song repeats, copy the same lyrics with new timestamps

4. **Test multiple times**: Sing along and adjust until it feels natural

5. **Consider singer's breath**: Add extra time for breathing between lines

---

## Current Song Structure

```
Intro (0-11s)
  ↓
Verse 1 (12-27s): 良師啊 / 是您一顆 / 愛心關懷 / 燃亮了我
  ↓
Verse 2 (30-47s): 良師啊 / 是您一顆 / 愛心關懷 / 燃亮了我
  ↓
Bridge (48-57s): 🎵 多謝您！🎵
  ↓
Verse 3 (58-75s): 良師啊 / 是您一顆 / 愛心關懷 / 燃亮了我
  ↓
Outro (76-82s): 🏆 世界紀錄！
```

---

## Adding More Lines

To extend the song, simply add more entries:

```javascript
{ time: 84000, text: "Your new lyric line" },
{ time: 88000, text: "Another line" },
{ time: 92000, text: "🏆 Final line! 🏆" }
```

Make sure the last timestamp matches your audio file's duration!

---

**Need Help?** 
- Open browser console (F12) to see debug logs
- Check that audio file duration matches last lyric timestamp
- Ensure timestamps are in ascending order
