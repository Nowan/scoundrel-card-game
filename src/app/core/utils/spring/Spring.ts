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

export class Spring {
    private position: SpringValue;
    private target: SpringValue;
    private pendingTarget: SpringValue | null = null;
    private velocity: SpringValue;
    private onUpdateCb: (v: SpringValue) => void = () => { };
    private onRestCb: (v: SpringValue) => void = () => { };

    private pendingDelayMS = 0;
    private driverHandle: any = null;

    private readonly stiffness: number;
    private readonly damping: number;
    private readonly precision: number;
    private readonly defaultDelay: number;
    private readonly driver: Driver;

    constructor(
        initialValue: SpringValue = 0,
        {
            stiffness = 200,
            damping = 10,
            precision = 100,
            delayMS: defaultDelay = 0,
            driver = rafDriver,
        }: {
            stiffness?: number;
            damping?: number;
            precision?: number;
            delayMS?: number;
            driver?: Driver;
        } = { driver: rafDriver }
    ) {
        this.stiffness = stiffness;
        this.damping = damping;
        this.precision = precision;
        this.defaultDelay = defaultDelay;
        this.driver = driver;

        this.position = this.cloneValue(initialValue);
        this.target = this.cloneValue(initialValue);
        this.pendingTarget = null;
        this.velocity = this.zeroLike(initialValue);
    }

    // helpers
    private cloneValue(v: SpringValue): SpringValue {
        if (Array.isArray(v)) return v.slice();
        if (v && typeof v === "object") return { ...v };
        return v as number;
    }

    private zeroLike(v: SpringValue): SpringValue {
        if (Array.isArray(v)) return v.map(() => 0);
        if (v && typeof v === "object")
            return Object.keys(v).reduce((acc: any, key) => {
                acc[key] = 0;
                return acc;
            }, {});
        return 0;
    }

    private forEachPair(
        a: SpringValue,
        b: SpringValue,
        fn: (aVal: number, bVal: number, key?: string | number) => number
    ): SpringValue {
        if (typeof a === "number" && typeof b === "number") return fn(a, b) as SpringValue;

        if (Array.isArray(a) && Array.isArray(b)) return a.map((aVal, i) => fn(aVal, b[i] ?? aVal, i));

        if (a && typeof a === "object" && b && typeof b === "object") {
            const keys = Array.from(new Set([...Object.keys(a as any), ...Object.keys(b as any)]));
            return keys.reduce((acc: any, k) => {
                acc[k] = fn((a as any)[k] ?? 0, (b as any)[k] ?? 0, k);
                return acc;
            }, {});
        }
        return a;
    }

    private add = (a: SpringValue, b: SpringValue) => this.forEachPair(a, b, (av, bv) => av + bv);
    private subtract = (a: SpringValue, b: SpringValue) => this.forEachPair(a, b, (av, bv) => av - bv);
    private mulScalar = (a: SpringValue, s: number): SpringValue => this.forEachPair(a, this.zeroLike(a), (av) => av * s);

    private absLessThan(a: SpringValue, threshold: number): boolean {
        if (typeof a === "number") return Math.abs(a) < threshold;
        if (Array.isArray(a)) return a.every((v) => Math.abs(v) < threshold);
        return Object.values(a).every((v: number) => Math.abs(v) < threshold);
    }

    private step = (deltaMS: number) => {
        if (this.pendingTarget && this.pendingDelayMS > 0) {
            this.pendingDelayMS -= deltaMS;
            if (this.pendingDelayMS <= 0) {
                this.target = this.cloneValue(this.pendingTarget!);
                this.pendingTarget = null;
            }
        }

        const dt = deltaMS / 1000;
        const distance = this.subtract(this.target, this.position);
        const acceleration = this.add(this.mulScalar(distance, this.stiffness), this.mulScalar(this.velocity, -this.damping));

        this.velocity = this.add(this.velocity, this.mulScalar(acceleration, dt));
        this.position = this.add(this.position, this.mulScalar(this.velocity, dt));

        const isComplete = this.absLessThan(this.velocity, 1 / this.precision) && this.absLessThan(this.subtract(this.position, this.target), 1 / this.precision);

        this.onUpdateCb(this.position);

        if (isComplete && !this.pendingTarget) {
            this.position = this.cloneValue(this.target);
            this.velocity = this.zeroLike(this.target);
            this.stopDriver();
            this.onRestCb(this.position);
        }
    };

    private startDriver() {
        if (!this.driverHandle) {
            this.driverHandle = this.driver((deltaMS: number) => this.step(deltaMS));
        }
        if (this.driverHandle && typeof this.driverHandle.start === "function") {
            this.driverHandle.start();
        }
    }

    private stopDriver() {
        if (!this.driverHandle) return;
        if (typeof this.driverHandle === "number") {
            cancelAnimationFrame(this.driverHandle);
        } else if (typeof this.driverHandle.stop === "function") {
            this.driverHandle.stop();
        }
        this.driverHandle = null;
    }

    // Public API
    setValue(value: SpringValue = 0) {
        this.stopDriver();
        this.position = this.cloneValue(value);
        this.target = this.cloneValue(value);
        this.pendingTarget = null;
        this.velocity = this.zeroLike(value);
        this.pendingDelayMS = 0;
        this.onUpdateCb(this.position);
    }

    transitionTo<T extends SpringValue = SpringValue>(value: T = 0 as T, options: { delayMS?: number } = {}) {
        const delay = options.delayMS ?? this.defaultDelay;

        if (delay > 0) {
            this.pendingTarget = this.cloneValue(value);
            this.pendingDelayMS = delay;
        } else {
            this.target = this.cloneValue(value);
            this.pendingTarget = null;
            this.pendingDelayMS = 0;
        }

        this.startDriver();
    }

    onUpdate(callback: (value: SpringValue) => void = () => { }) {
        this.onUpdateCb = callback;
        callback(this.position);
    }

    onRest(callback: (value: SpringValue) => void = () => { }) {
        this.onRestCb = callback;
    }

    destroy() {
        this.stopDriver();
        this.onUpdateCb = () => { };
        this.onRestCb = () => { };
    }
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