/**
 * Utility type to define a fixed-length array.
 * 
 * Example:
 *   type FourElementsArray = FixedLengthArray<CardModel | null, 4>;
 * 
 * This ensures the array has exactly 4 elements,
 * all of which match the specified element type.
 */
export type FixedLengthArray<ELEMENT, LENGTH extends number> =
    LENGTH extends LENGTH
    ? number extends LENGTH
    ? ELEMENT[] // fallback for non-literal numbers
    : ComposeFixedLengthArray<ELEMENT, LENGTH, []>
    : never;

/**
 * Internal helper type – recursively builds up an array
 * until its length matches the desired one.
 */
type ComposeFixedLengthArray<ELEMENT, LENGTH extends number, ACCUMULATOR extends unknown[]> =
    ACCUMULATOR['length'] extends LENGTH
    ? ACCUMULATOR
    : ComposeFixedLengthArray<ELEMENT, LENGTH, [ELEMENT, ...ACCUMULATOR]>;