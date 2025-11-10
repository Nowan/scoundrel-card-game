export function enumValues<T extends object>(object: T): Array<T[keyof T]> {
    return enumKeys(object).map(key => object[key]);
}

export function enumKeys<T extends object>(object: T): Array<keyof T> {
    return Object.keys(object).filter(key => !isNaN(Number(object[key]))) as Array<keyof T>;
}