export type SpringScalarValue = number;
export type SpringArrayValue = number[];
export type SpringObjectValue = { [key: string]: number };
export type SpringValue =
    | SpringScalarValue
    | SpringArrayValue
    | SpringObjectValue;

type Driver =
    | ((cb: (deltaMS: number) => void) => {
        start: () => void;
        stop: () => void;
    });

export function Spring(
    initialValue: SpringValue = 0,
    {
        stiffness = 200,
        damping = 10,
        precision = 100,
        delayMS: defaultDelay = 0,
        driver = rafDriver
    }: {
        stiffness?: number;
        damping?: number;
        precision?: number;
        delayMS?: number;
        driver?: Driver;
    } = { driver: rafDriver }
) {
    // === Internal State ===
    let position: SpringValue = cloneValue(initialValue);
    let target: SpringValue = cloneValue(initialValue);
    let pendingTarget: SpringValue | null = null;
    let velocity: SpringValue = zeroLike(initialValue);
    let onUpdate: (v: SpringValue) => void = () => { };
    let onRest: (v: SpringValue) => void = () => { };

    // delay and driver management
    let pendingDelayMS = 0;
    let driverHandle: any = null;

    // === Helpers ===
    function cloneValue(v: SpringValue): SpringValue {
        if (Array.isArray(v)) return v.slice();
        if (v && typeof v === "object") return { ...v };
        return v as number;
    }

    function zeroLike(v: SpringValue): SpringValue {
        if (Array.isArray(v)) return v.map(() => 0);
        if (v && typeof v === "object")
            return Object.keys(v).reduce((acc: any, key) => {
                acc[key] = 0;
                return acc;
            }, {});
        return 0;
    }

    function forEachPair(
        a: SpringValue,
        b: SpringValue,
        fn: (aVal: number, bVal: number, key?: string | number) => number
    ): SpringValue {
        if (typeof a === "number" && typeof b === "number")
            return fn(a, b) as SpringValue;

        if (Array.isArray(a) && Array.isArray(b))
            return a.map((aVal, i) => fn(aVal, b[i] ?? aVal, i));

        if (a && typeof a === "object" && b && typeof b === "object") {
            const keys = Array.from(
                new Set([...Object.keys(a as any), ...Object.keys(b as any)])
            );
            return keys.reduce((acc: any, k) => {
                acc[k] = fn((a as any)[k] ?? 0, (b as any)[k] ?? 0, k);
                return acc;
            }, {});
        }
        return a;
    }

    const add = (a: SpringValue, b: SpringValue) =>
        forEachPair(a, b, (av, bv) => av + bv);
    const subtract = (a: SpringValue, b: SpringValue) =>
        forEachPair(a, b, (av, bv) => av - bv);
    const mulScalar = (a: SpringValue, s: number): SpringValue =>
        forEachPair(a, zeroLike(a), (av) => av * s);

    function absLessThan(a: SpringValue, threshold: number): boolean {
        if (typeof a === "number") return Math.abs(a) < threshold;
        if (Array.isArray(a)) return a.every((v) => Math.abs(v) < threshold);
        return Object.values(a).every((v: number) => Math.abs(v) < threshold);
    }

    // === Main Step ===
    function step(deltaMS: number) {
        // If we have a delayed new target, count down while still animating toward current one
        if (pendingTarget && pendingDelayMS > 0) {
            pendingDelayMS -= deltaMS;
            if (pendingDelayMS <= 0) {
                target = cloneValue(pendingTarget);
                pendingTarget = null;
            }
        }

        const dt = deltaMS / 1000;
        const distance = subtract(target, position);
        const acceleration = add(mulScalar(distance, stiffness), mulScalar(velocity, -damping));

        velocity = add(velocity, mulScalar(acceleration, dt));
        position = add(position, mulScalar(velocity, dt));

        const isComplete =
            absLessThan(velocity, 1 / precision) &&
            absLessThan(subtract(position, target), 1 / precision);

        onUpdate(position);

        if (isComplete && !pendingTarget) {
            position = cloneValue(target);
            velocity = zeroLike(target);
            stopDriver();
            onRest(position);
        }
    }

    // === Driver Control ===
    function startDriver() {
        if (!driverHandle) {
            driverHandle = driver((deltaMS: number) => step(deltaMS));
        }
        if (driverHandle && typeof driverHandle.start === "function") {
            driverHandle.start();
        }
    }

    function stopDriver() {
        if (!driverHandle) return;
        if (typeof driverHandle === "number") {
            cancelAnimationFrame(driverHandle);
        } else if (typeof driverHandle.stop === "function") {
            driverHandle.stop();
        }
        driverHandle = null;
    }

    // === Public API ===
    return {
        /** Immediately sets the value without animation. */
        setValue(value: SpringValue = 0) {
            stopDriver();
            position = cloneValue(value);
            target = cloneValue(value);
            pendingTarget = null;
            velocity = zeroLike(value);
            pendingDelayMS = 0;
            onUpdate(position);
        },

        /**
         * Transitions to a new target with optional delay.
         * The spring continues toward its current target while waiting.
         */
        transitionTo(value: SpringValue = 0, options: { delayMS?: number } = {}) {
            const delay = options.delayMS ?? defaultDelay;

            if (delay > 0) {
                pendingTarget = cloneValue(value);
                pendingDelayMS = delay;
            } else {
                target = cloneValue(value);
                pendingTarget = null;
                pendingDelayMS = 0;
            }

            startDriver();
        },

        onUpdate(callback: (value: SpringValue) => void = () => { }) {
            onUpdate = callback;
            callback(position);
        },

        onRest(callback: (value: SpringValue) => void = () => { }) {
            onRest = callback;
        },

        destroy() {
            stopDriver();
            onUpdate = () => { };
            onRest = () => { };
        },
    };
}

const rafDriver = (cb: (deltaMS: number) => void) => {
    // default driver using requestAnimationFrame
    let rafId: number | null = null;
    let lastTime = performance.now();

    const loop = () => {
        const now = performance.now();
        const delta = now - lastTime;
        lastTime = now;
        cb(delta);
        rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return {
        start() {
            if (rafId == null) {
                lastTime = performance.now();
                rafId = requestAnimationFrame(loop);
            }
        },
        stop() {
            if (rafId != null) cancelAnimationFrame(rafId);
            rafId = null;
        },
    };
}