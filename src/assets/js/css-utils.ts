export function getCssVar(name: string) {
  return getComputedStyle(document.body).getPropertyValue(name)
}
