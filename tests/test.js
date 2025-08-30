// Tests for script.js

console.group(interpolateColor.name);
	console.assert(
		interpolateColor('#000000', '#ffffff', 0.0) === '#000000',
		'factor = 0'
	);
	console.assert(
		interpolateColor('#000000', '#ffffff', 1.0) === '#ffffff',
		'factor = 1'
	);
	console.assert(
		interpolateColor('#000000', '#ffffff', 0.5) === '#808080',
		'factor = 0.5'
	);
	console.assert(
		interpolateColor('#ff0000', '#0000ff', 0.5) === '#800080',
		'factor = 0.5 (red, blue)'
	);
console.groupEnd();

console.group(getPaletteForTime.name);
	TIME_KEYFRAMES.forEach(({ time, palette }, i) => {
		const result = getPaletteForTime(time);
		console.assert(
			result.sky === palette.sky,
			`sky at ${time}h (keyframe ${i})`
		);
		console.assert(
			result.fog === palette.fog,
			`fog at ${time}h (keyframe ${i})`
		);
		console.assert(
			result.sun === palette.sun,
			`sun at ${time}h (keyframe ${i})`
		);
		console.assert(
			result.sunGlow === palette.sunGlow,
			`sunGlow at ${time}h (keyframe ${i})`
		);
	});
	console.assert(
		getPaletteForTime(19).sky === interpolateColor(
			TIME_KEYFRAMES[4].palette.sky,
			TIME_KEYFRAMES[5].palette.sky,
			0.5
		),
		'sky at 19h (between keyframes)'
	);
console.groupEnd();

// Tests for home.js

console.group(convertHoursToHm.name);
	console.assert(convertHoursToHm(0) === '0時間0分', '0h');
	console.assert(convertHoursToHm(0.5) === '0時間30分', '0.5h');
	console.assert(convertHoursToHm(12) === '12時間0分', '12h');
	console.assert(convertHoursToHm(23.9999999999999999) === '24時間0分', '23.9999999999999999h');
console.groupEnd();

console.group(setStats.name);
	setStats();
	console.assert(statsTableBody.innerHTML.includes('標本数'), 'Sample size');
	console.assert(statsTableBody.innerHTML.includes('覚醒時間の平均'), 'Awake duration mean');
	console.assert(statsTableBody.innerHTML.includes('睡眠時間の平均'), 'Sleep duration mean');
	console.assert(statsTableBody.innerHTML.includes('線形回帰の関数（回帰式）'), 'Linear regression function');
	console.assert(statsTableBody.innerHTML.includes('線形回帰のR²'), 'Linear regression R²');
	console.assert(statsTableBody.innerHTML.includes('線形回帰の補正R²'), 'Linear regression adjusted R²');
console.groupEnd();
