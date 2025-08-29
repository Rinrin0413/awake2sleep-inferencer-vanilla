// Constants

// Color palette for different environments.
// Some colors were transplanted from the "Tempest Shaders for JE":
// https://github.com/Rinrin0413/Tempest-Shaders_JE/blob/84c26645b2ecfd6c169182fb4069c105476fdc68/shaders/lib/utils/colors.glsl
// © 2022 Rinrin.rs | CC-BY-4.0 license
const ENV_PALETTE = {
	// ~ 20:00 ~ 4:00 ~
	night: {
		sky: '#101a2a',
		fog: '#000000',
		sun: '#ffd700',
		sunGlow: '#fffae0'
	},
	// ~ 5:30 ~
	dawn: {
		sky: '#1e2a35',
		fog: '#b56609',
		sun: '#ffa300',
		sunGlow: '#fffefb'
	},
	// ~ 13:00 ~ 16:00 ~
	day: {
		sky: '#3378bd',
		fog: '#ccf2ff',
		sun: '#ffbe16',
		sunGlow: '#fffcf3'
	},
	// ~ 18:00 ~
	dusk: {
		sky: '#212e2e',
		fog: '#6e2900',
		sun: '#ffb380',
		sunGlow: '#ffffff'
	}
};

const TIME_KEYFRAMES = [
	{ time: 4, palette: ENV_PALETTE.night },
	{ time: 5.5, palette: ENV_PALETTE.dawn },
	{ time: 13, palette: ENV_PALETTE.day },
	{ time: 16, palette: ENV_PALETTE.day },
	{ time: 18, palette: ENV_PALETTE.dusk },
	{ time: 20, palette: ENV_PALETTE.night }
];

// Functions

function interpolateColor(color1, color2, factor) {
	const hex1 = color1.replace('#', '');
	const hex2 = color2.replace('#', '');

	const r1 = parseInt(hex1.substr(0, 2), 16);
	const g1 = parseInt(hex1.substr(2, 2), 16);
	const b1 = parseInt(hex1.substr(4, 2), 16);

	const r2 = parseInt(hex2.substr(0, 2), 16);
	const g2 = parseInt(hex2.substr(2, 2), 16);
	const b2 = parseInt(hex2.substr(4, 2), 16);

	const r = Math.round(r1 + (r2 - r1) * factor);
	const g = Math.round(g1 + (g2 - g1) * factor);
	const b = Math.round(b1 + (b2 - b1) * factor);

	return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function getPaletteForTime(hour) {
	// Extend the keyframes for seamless 24-hour cycle.
	const keyframes = [
		// Previous day's last keyframe
		{
			time: TIME_KEYFRAMES[TIME_KEYFRAMES.length - 1].time - 24,
			palette: TIME_KEYFRAMES[TIME_KEYFRAMES.length - 1].palette
		},
		// Defined keyframes
		...TIME_KEYFRAMES,
		// Next day's first keyframe
		{
			time: TIME_KEYFRAMES[0].time + 24,
			palette: TIME_KEYFRAMES[0].palette
		}
	].sort((a, b) => a.time - b.time);

	let frameStart, frameEnd;
	for (let i = 0; i < keyframes.length - 1; i++) {
		frameStart = keyframes[i];
		frameEnd = keyframes[i + 1];
		if (frameStart.time <= hour && hour < frameEnd.time) break;
	}

	const paletteFrom = frameStart.palette;
	const paletteTo = frameEnd.palette;

	const frameDuration = frameEnd.time - frameStart.time;

	if (
		// Midnight and Midday
		paletteFrom === paletteTo ||
		// Avoid division by zero.
		frameDuration === 0
	) return paletteFrom;

	const factor = (hour - frameStart.time) / frameDuration;

	return {
		sky: interpolateColor(paletteFrom.sky, paletteTo.sky, factor),
		fog: interpolateColor(paletteFrom.fog, paletteTo.fog, factor),
		sun: interpolateColor(paletteFrom.sun, paletteTo.sun, factor),
		sunGlow: interpolateColor(paletteFrom.sunGlow, paletteTo.sunGlow, factor)
	};
}

/** @param {number} hour The environment time in hours (0 <= n < 24). */
function updateEnv(hour) {
	// ㎭ = h / 24 * 2 * π
	const rad = hour / 24 * 2 * Math.PI;

	const palette = getPaletteForTime(hour);

	const style = document.documentElement.style;
	style.setProperty('--sun-x', Math.sin(rad));
	style.setProperty('--sun-y', -Math.cos(rad));
	style.setProperty('--sky-color', palette.sky);
	style.setProperty('--fog-color', palette.fog);
	style.setProperty('--sun-color', palette.sun);
	style.setProperty('--sun-glow-color', palette.sunGlow);
}
