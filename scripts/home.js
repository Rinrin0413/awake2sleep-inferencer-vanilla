// Constants

const STATISTICS = {sampleCount:392,date:'2025-07-31',stats:{awake:{mean:17.92308673478316,stdDeviation:5.956283313256553},sleep:{mean:10.056717687102038,stdDeviation:3.460559074456975},correlation:0.27352961310113827},regrModels:[{name:'4次多項式回帰',f:(x)=>5.128106740758042+1.077137940829176*x-0.09956195828094334*x**2+0.003919915914416868*x**3-0.00005065416899167597*x**4,r2:0.08431712866039276},{name:'指数回帰',f:(x)=>6.7647847710369655*Math.exp(0.01833432736163257*x),r2:0.0787984945432123},{name:'2次多項式回帰',f:(x)=>7.803418558050871+0.09180128263043144*x+0.001704700303946596*x**2,r2:0.0756192526881635},{name:'線形回帰',f:(x)=>0.15891879801001607*x+7.2084022865810375,r2:0.07481844924325232},{name:'累乗回帰',f:(x)=>4.549697877590112*x**0.2571041805844064,r2:0.07037800419877571},{name:'対数回帰',f:(x)=>2.1352071645251405*Math.log(x)+4.033410707515911,r2:0.061343550343847975}]};

// Color palette for different environments.
// Some colors were transplanted from the "Tempest Shaders for JE":
// https://github.com/Rinrin0413/Tempest-Shaders_JE/blob/84c26645b2ecfd6c169182fb4069c105476fdc68/shaders/lib/utils/colors.glsl
// © 2022 Rinrin.rs | CC-BY-4.0 license
const ENV_PALETTE = {
	//  19:00 ~ 0:00 ~ 4:00
	night: {
		sky: '#101a2a',
		fog: '#000000',
		sun: '#ffd700',
		sunGlow: '#fffae0'
	},
	// 4:00 ~ 6:00
	dawn: {
		sky: '#1e2a35',
		fog: '#b56609',
		sun: '#ffa300',
		sunGlow: '#fffefb'
	},
	// 6:00 ~ 17:00
	day: {
		sky: '#3378bd',
		fog: '#ccf2ff',
		sun: '#ffbe16',
		sunGlow: '#fffcf3'
	},
	// 17:00 ~ 19:00
	dusk: {
		sky: '#212e2e',
		fog: '#6e2900',
		sun: '#ffb380',
		sunGlow: '#ffffff'
	}
};

// Variables
let infSleepDurationMean = 0;

// HTML elements
const input = document.getElementById('awake-dur-input');
const resultsTableBody = document.getElementById('results');
const sunElement = document.getElementById('sun');

// Functions

function convertHoursToHm(hours) {
	const h = Math.floor(hours);
	const m = Math.round((hours - h) * 60);
	return `${h}時間${m}分`;
}

function updateResults() {
	const awakeDuration = parseFloat(input.value);
	const sleepDurations = STATISTICS.regrModels.reduce(
		(acc, model) => {
			acc[model.name] = model.f(awakeDuration);
			return acc;
		}, {}
	);

	infSleepDurationMean = STATISTICS.regrModels.reduce((acc, model) => {
		let sleepDuration = sleepDurations[model.name];
		if (sleepDuration < 0) sleepDuration = 0;
		return acc + sleepDuration;
	}, 0) / STATISTICS.regrModels.length;

	resultsTableBody.innerHTML = STATISTICS.regrModels
		.map((model) => {
			const name = model.name;
			return `<tr>
	<td>${name}</td>
	<td>${convertHoursToHm(sleepDurations[name])}</td>
	<td>${model.r2.toFixed(4)}</td>
</tr>`;
		}).join('') + `<tr>
	<td>ReLU の平均</td>
	<td>${convertHoursToHm(infSleepDurationMean)}</td>
	<td></td>
</tr>`;
}

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
	let palette1, palette2, factor;

	switch (true) {
		case (0 <= hour && hour < 4):
			return ENV_PALETTE.night;
		case (4 <= hour && hour < 6):
			palette1 = ENV_PALETTE.night;
			palette2 = ENV_PALETTE.dawn;
			factor = (hour - 4) / 2;
			break;
		case (6 <= hour && hour < 17):
			palette1 = ENV_PALETTE.dawn;
			palette2 = ENV_PALETTE.day;
			factor = (hour - 6) / 11;
			break;
		case (17 <= hour && hour < 19):
			palette1 = ENV_PALETTE.day;
			palette2 = ENV_PALETTE.dusk;
			factor = (hour - 17) / 2;
			break;
		default:
			palette1 = ENV_PALETTE.dusk;
			palette2 = ENV_PALETTE.night;
			factor = (hour - 19) / 5;
			break;
	}

	return {
		sky: interpolateColor(palette1.sky, palette2.sky, factor),
		fog: interpolateColor(palette1.fog, palette2.fog, factor),
		sun: interpolateColor(palette1.sun, palette2.sun, factor),
		sunGlow: interpolateColor(palette1.sunGlow, palette2.sunGlow, factor)
	};
}

function updateEnv() {
	// 3600000 = 60 * 60 * 1000
	const futureDate = new Date((new Date()).getTime() + infSleepDurationMean * 3600000);
	const futureHour = futureDate.getHours() + futureDate.getMinutes() / 60;

	// ㎭ = h / 24 * 2 * π
	const rad = futureHour / 24 * 2 * Math.PI;

	const palette = getPaletteForTime(futureHour);

	const style = document.documentElement.style;
	style.setProperty('--sun-x', Math.sin(rad));
	style.setProperty('--sun-y', -Math.cos(rad));
	style.setProperty('--sky-color', palette.sky);
	style.setProperty('--fog-color', palette.fog);
	style.setProperty('--sun-color', palette.sun);
	style.setProperty('--sun-glow-color', palette.sunGlow);
}

// Other

// Initialize default input value, results and environment.
input.value = STATISTICS.stats.awake.mean.toFixed(1);
updateResults();
updateEnv();

input.addEventListener('input', () => {
	updateResults();
	updateEnv();
});
