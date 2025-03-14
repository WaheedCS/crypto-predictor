export function formatPrice(price: string) {
  const numericPrice = parseFloat(price.replace(/,/g, "")); // Convert string to number and remove commas
  if (numericPrice >= 1_000_000) {
    return (numericPrice / 1_000_000).toFixed(2).replace(/\.?0+$/, "") + "M";
  } else if (numericPrice >= 1_000) {
    return (numericPrice / 1_000).toFixed(2).replace(/\.?0+$/, "") + "k";
  } else {
    return numericPrice.toFixed(2).replace(/\.?0+$/, "");
  }
}
