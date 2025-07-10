module.exports = function matchBiometrics(input, stored) {
  console.log('🧠 Comparing Behavioral Biometrics...');

  if (!stored || !input) {
    console.log('❌ Either input or stored biometric is missing');
    return false;
  }

  // --- 1. Keystroke dwell time ---
  const extractDwell = (data) =>
    data.map(k => k.upTime - k.downTime).filter(t => t > 0);

  const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  const inputDwell = extractDwell(input.keystrokes);
  const storedDwell = extractDwell(stored.keystrokes);

  const inputAvgDwell = avg(inputDwell);
  const storedAvgDwell = avg(storedDwell);

  const dwellDiff = Math.abs(inputAvgDwell - storedAvgDwell);
  const dwellMatch = dwellDiff <= 300; // relaxed threshold (ms)

  console.log(`⌨️ Keystroke Dwell - Input: ${inputAvgDwell.toFixed(2)} ms, Stored: ${storedAvgDwell.toFixed(2)} ms, Diff: ${dwellDiff}, Match: ${dwellMatch}`);

  // --- 2. Mouse movement ---
  const inputMouseLen = input.mouse?.length || 0;
  const storedMouseLen = stored.mouse?.length || 0;
  const mouseDiff = Math.abs(inputMouseLen - storedMouseLen);
  const mouseMatch = inputMouseLen > 0 && storedMouseLen > 0 && mouseDiff <= 50;

  console.log(`🖱 Mouse Events - Input: ${inputMouseLen}, Stored: ${storedMouseLen}, Diff: ${mouseDiff}, Match: ${mouseMatch}`);

  // --- 3. Navigation overlap check ---
  const inputNavPage = input.navigation?.[0]?.page || '';
  const storedNavPage = stored.navigation?.[0]?.page || '';
  const navMatch = inputNavPage && storedNavPage && inputNavPage === storedNavPage;

  console.log(`🧭 Navigation - Input Page: "${inputNavPage}", Stored Page: "${storedNavPage}", Match: ${navMatch}`);

  // Final decision
  const finalMatch = dwellMatch && mouseMatch && navMatch;

  console.log(`✅ Final Match Decision: ${finalMatch ? 'PASS' : 'FAIL'}\n`);
  return finalMatch;
};
