function analyzePattern() {

  if (numbers.length < 8) {

    return {
      prediction: "WAIT",
      confidence: 0,
      trend: "COLLECTING DATA",
      neighbors: [],
      alert: "WAITING MORE SPINS"
    };
  }

  const recent = numbers.slice(0, 12);

  // ===== DÚZIAS =====

  const dozens = {
    first:
      recent.filter(n =>
        n >= 1 && n <= 12
      ).length,

    second:
      recent.filter(n =>
        n >= 13 && n <= 24
      ).length,

    third:
      recent.filter(n =>
        n >= 25 && n <= 36
      ).length
  };

  const strongest =
    Object.entries(dozens)
      .sort((a,b)=>b[1]-a[1])[0];

  let prediction = "WAIT";
  let confidence = 0;
  let trend = "NO TREND";

  if (strongest[1] >= 5) {

    prediction =
      strongest[0] === "first"
        ? "1ST 12"
        : strongest[0] === "second"
        ? "2ND 12"
        : "3RD 12";

    confidence = 78;

    trend = "DOZEN MOMENTUM";
  }

  // ===== ALERTAS SECUNDÁRIOS =====

  const finals = {};

  recent.forEach(n => {

    const final = n % 10;

    finals[final] =
      (finals[final] || 0) + 1;
  });

  const hotFinal =
    Object.entries(finals)
      .sort((a,b)=>b[1]-a[1])[0];

  let alert = "NO ALERT";

  if (hotFinal[1] >= 3) {

    alert =
      `FINAL ${hotFinal[0]} HOT`;
  }

  // ===== VIZINHOS DO ZERO =====

  const zeroNeighbors =
    getNeighbors(0);

  const zeroHits =
    recent.filter(n =>
      zeroNeighbors.includes(n)
    ).length;

  if (zeroHits <= 1) {

    alert =
      "NEIGHBORS OF 0 POSSIBLE";
  }

  return {
    prediction,
    confidence,
    trend,
    neighbors:
      prediction !== "WAIT"
        ? []
        : zeroNeighbors,
    alert
  };
}
