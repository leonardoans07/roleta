function analyzePattern(numbers) {
  if (numbers.length < 6) {
    return {
      prediction: "WAIT",
      confidence: 0,
      trend: "WAITING"
    };
  }

  const last = numbers[0];
  const second = numbers[1];
  const third = numbers[2];

  const lastDigit = n => n % 10;

  // ===== FINAL IGUAL =====
  if (
    lastDigit(last) === lastDigit(second) &&
    lastDigit(second) !== lastDigit(third)
  ) {
    return {
      prediction: `FINAL ${lastDigit(last)}`,
      confidence: 88,
      trend: "DOUBLE FINAL DETECTED"
    };
  }

  // ===== REPETIÇÃO DUPLA =====
  if (last === second && second !== third) {
    return {
      prediction: `BREAK AFTER ${last}`,
      confidence: 91,
      trend: "DOUBLE NUMBER BREAK"
    };
  }

  // ===== FINAL 5 =====
  const final5 = numbers.filter(n => n % 10 === 5).length;

  if (final5 >= 3) {
    return {
      prediction: "FINAL 5",
      confidence: 82,
      trend: "FINAL 5 TREND"
    };
  }

  // ===== DOZENS =====
  const dozens = {
    first: numbers.filter(n => n >= 1 && n <= 12).length,
    second: numbers.filter(n => n >= 13 && n <= 24).length,
    third: numbers.filter(n => n >= 25 && n <= 36).length
  };

  const maxDozen = Object.entries(dozens).sort((a,b)=>b[1]-a[1])[0];

  if (maxDozen[1] >= 4) {
    return {
      prediction:
        maxDozen[0] === "first"
          ? "1ST 12"
          : maxDozen[0] === "second"
          ? "2ND 12"
          : "3RD 12",
      confidence: 75,
      trend: "DOZEN MOMENTUM"
    };
  }

  return {
    prediction: "WAIT",
    confidence: 0,
    trend: "NO TREND"
  };
}
