export function arrayShuffle<T extends any = any>(array: Array<T>, randomNumberGenerator: () => number = Math.random): Array<T> {
    // https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(randomNumberGenerator() * (i + 1));

        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    return array;
}

export const shuffle = arrayShuffle;