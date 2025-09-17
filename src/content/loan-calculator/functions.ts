export function totalMontlyPayment(loanAmount: number, termInterest: number, numberOfTerms: number): number {
  return bankersRound((loanAmount * termInterest * Math.pow(1 + termInterest, numberOfTerms)) / (Math.pow(1 + termInterest, numberOfTerms) - 1));
}

export function principlePayment(totalMonthly: number, outstandingBalance: number, termInterest: number): number {
  return bankersRound(totalMonthly - (outstandingBalance * termInterest));
}

export function bankersRound(amount: number, decimalPlaces: number = 2): number {
  const placeAdjusted = amount * Math.pow(10, decimalPlaces);
  const rounded = Math.round(placeAdjusted);
  var roundedPlaceAdjusted = Math.abs(placeAdjusted) % 1 === 0.5 ? (rounded % 2 === 0 ? rounded : rounded - 1) : rounded;
  return roundedPlaceAdjusted / Math.pow(10, decimalPlaces);
}

export function formatCurrency(amount: number): string {
  return Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    trailingZeroDisplay: 'stripIfInteger',
  }).format(amount);
}

export function getCssVar(name: string) {
  return getComputedStyle(document.body).getPropertyValue(name)
}
