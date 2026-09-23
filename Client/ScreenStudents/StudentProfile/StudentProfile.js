function updateWellbeingSummary() {
    const entries = safeParse(localStorage.getItem("sentirDiaryEntries"), []);
    const badges = safeParse(localStorage.getItem("sentirUnlockedBadges"), []);
    const validEntries = Array.isArray(entries) ? entries : [];
    const validBadges = Array.isArray(badges) ? badges : [];

    const now = new Date();
    const monthlyEntries = validEntries.filter(function (entry) {
        const date = new Date(entry.createdAt || entry.date || 0);
        return date.getFullYear() === now.getFullYear() &&
               date.getMonth() === now.getMonth();
    });

    setText("diaryCount", String(monthlyEntries.length));
    setText("badgeCount", String(validBadges.length));

    if (validEntries.length) {
        const sorted = [...validEntries].sort(function (a, b) {
            return new Date(b.createdAt || b.date || 0) -
                   new Date(a.createdAt || a.date || 0);
        });

        const emotion = sorted[0].emotion || "Registrada";
        setText("lastEmotionText", emotion);
        document.getElementById("lastEmotionEmoji").innerHTML =
            emotionEmoji(emotion);
    }
}

function emotionEmoji(emotion) {
    const normalized = normalizeText(emotion);
    let face = "";

    if (normalized.includes("muy mal")) face = "angry";
    else if (normalized === "mal") face = "sad";
    else if (normalized.includes("regular")) face = "ok";
    else if (normalized.includes("muy bien")) face = "happy";
    else if (normalized === "bien" || normalized.includes("tranquil")) face = "good";

    if (!face) return "";

    const eye =
        '<svg class="eye" viewBox="0 0 7 4">' +
        '<path d="M1,1 C1.83333333,2.16666667 2.66666667,2.75 3.5,2.75 C4.33333333,2.75 5.16666667,2.16666667 6,1"/>' +
        '</svg>';

    const mouth =
        '<svg class="mouth" viewBox="0 0 18 7">' +
        '<path d="M1,5.5 C3.66666667,2.5 6.33333333,1 9,1 C11.6666667,1 14.3333333,2.5 17,5.5"/>' +
        '</svg>';

    const features = face === "ok"
        ? ""
        : eye.replace('class="eye"', 'class="eye left"') +
          eye.replace('class="eye"', 'class="eye right"') +
          (face === "happy" ? "" : mouth);

    return '<span class="emoji ' + face + '">' +
           '<span class="emoji-face"></span>' +
           '<span class="emoji-features">' + features + '</span>' +
           '</span>';
}