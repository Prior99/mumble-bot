import RNG from "rng-js";
import * as Color from "onecolor";

export function colorify(str: string) {
    const rng = new RNG(str);
    const hue = rng.uniform();
    const saturation = 1;
    const brightness = 0.4;
    const color = Color("#FFFFFF").hue(hue).saturation(saturation).lightness(brightness).hex();
    return color;
}