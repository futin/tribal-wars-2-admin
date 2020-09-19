// node core modules

// 3rd party modules

// local modules

export const transformTargetCoordinates = coordinates =>
  coordinates
    .map(coordinate => {
      const [x, y] = coordinate.split('|')
      if (!x || !y) return
      return { x: parseInt(x, 10), y: parseInt(y, 10) }
    })
    .filter(Boolean)

export const transformDuration = duration => {
  const units = ['hours', 'minutes', 'seconds']
  return units
    .map(unit => duration.get(unit))
    .map(unit => unit < 10 ? `0${unit}` : unit)
    .join(':')
}
