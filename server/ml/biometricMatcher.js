  // /server/ml/biometricMatcher.js

  /**
   * Basic similarity matching function
   * This is a placeholder; you can replace with ML model later.
   */
  function compareBiometricData(stored, incoming) {
    if (!stored || !incoming) return false;

    let score = 0;
    let total = 0;

    // Keystrokes: compare average key press durations (simple example)
    if (stored.keystrokes?.length && incoming.keystrokes?.length) {
      const avgStored = average(stored.keystrokes.map(k => k.duration || 0));
      const avgIncoming = average(incoming.keystrokes.map(k => k.duration || 0));
      score += similarityScore(avgStored, avgIncoming);
      total++;
    }

    // Mouse: compare total movement distance
    if (stored.mouse?.length && incoming.mouse?.length) {
      const totalStored = totalMouseMovement(stored.mouse);
      const totalIncoming = totalMouseMovement(incoming.mouse);
      score += similarityScore(totalStored, totalIncoming);
      total++;
    }

    // Touch: (for mobile)
    if (stored.touches?.length && incoming.touches?.length) {
      const avgStored = average(stored.touches.map(t => t.duration || 0));
      const avgIncoming = average(incoming.touches.map(t => t.duration || 0));
      score += similarityScore(avgStored, avgIncoming);
      total++;
    }

    // Navigation time
    if (stored.loginTime && incoming.loginTime) {
      score += similarityScore(stored.loginTime, incoming.loginTime);
      total++;
    }

    const similarity = total > 0 ? score / total : 0;
    return similarity >= 0.7; // Threshold of 70% similarity
  }

  function average(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  function similarityScore(a, b) {
    const diff = Math.abs(a - b);
    return 1 - diff / (Math.max(a, b) || 1); // Normalize to 0–1
  }

  function totalMouseMovement(movements) {
    let distance = 0;
    for (let i = 1; i < movements.length; i++) {
      const dx = movements[i].x - movements[i - 1].x;
      const dy = movements[i].y - movements[i - 1].y;
      distance += Math.sqrt(dx * dx + dy * dy);
    }
    return distance;
  }

  module.exports = compareBiometricData;
