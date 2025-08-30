// Constants

const STATISTICS = {nSamples:415,date:'2025-08-30',corr:0.2929892534857489,pVal:0.0000000011672481,variableStats:{awakeStats:{mean:18.048313253161446,median:16.85,stdDev:6.082984556922239,min:1.1,max:38.8,q1:14.4,q3:20.833333335},sleepStats:{mean:10.057269076327712,median:9.9,stdDev:3.443207863759098,min:2.3,max:20.11666667,q1:7.5916666665,q3:12.425}},regrModels:[{name:'線形重回帰',f:(x,dow)=>{dowAdj={Friday:0.,'Monday':2.8417825004254604,'Saturday':-0.3301117070069033,'Sunday':4.4138407443592582,'Thursday':2.0604072684906534,'Tuesday':2.7449363992425666,'Wednesday':2.7670567035724094}[dow];return 0.1596267876867467*x+dowAdj+4.939601558674242},r2:0.32678621595997237,adjR2:0.3146718291006402},{name:'指数回帰',f:(x)=>6.6680188276709478*Math.exp(0.0190259312540539*x),r2:0.08861330118750677,adjR2:0.08640655373275496},{name:'4次多項式回帰',f:(x)=>5.562494550932529+0.8528265973429733*x-0.0754777520661394*(x*x)+0.0029966333647380*(x*x*x)-0.0000389884803673*(x*x*x*x),r2:0.09154948866277113,adjR2:0.08268655684484694},{name:'線形回帰',f:(x)=>0.1658434099509640*x+7.064075262560241,r2:0.08584270265813643,adjR2:0.08362924673236927},{name:'2次多項式回帰',f:(x)=>7.55008932040718+0.1117127296688957*x+0.0013537748394873*(x*x),r2:0.08637169231294983,adjR2:0.08193660344068254},{name:'3次多項式回帰',f:(x)=>7.855243694808822+0.0489595049078617*x+0.0050416994116160*(x*x)-0.0000635818714277*(x*x*x),r2:0.08650014797717465,adjR2:0.0798322658456212},{name:'累乗回帰',f:(x)=>4.3486804504855536*x**0.2726423464117007,r2:0.07900886075068536,adjR2:0.0767788579922124},{name:'対数回帰',f:(x)=>2.2825597445590042*Math.log(x)+3.6038331586397438,r2:0.07060465915819891,adjR2:0.0683543072433278}]};

// Variables
let infSleepDurationMean = 0;

// HTML elements
const input = document.getElementById('awake-dur-input');
const toggleSwitch = document.getElementById('dow-toggle');
const selectContainer = document.getElementById('select-container');
const select = document.getElementById('dow-select');
const resultsTableBody = document.getElementById('results');
const statsTableBody = document.getElementById('stats');

// Functions

function convertHoursToHm(hours) {
	const totalM = Math.round(hours * 60);
	const h = Math.floor(totalM / 60);
	const m = totalM % 60;
	return `${h}時間${m}分`;
}

function getCurrentDayOfWeek() {
	return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
		(new Date()).getDay()
	];
}

function updateResults() {
	const awakeDuration = parseFloat(input.value);
	const enableMultiRegr = toggleSwitch.checked;
	const selectedDayOfWeek = enableMultiRegr ? select.value : null;

	if (enableMultiRegr) selectContainer.classList.remove('hidden');
	else selectContainer.classList.add('hidden');

	let sleepDurations = {};
	let enabledModels = [];

	STATISTICS.regrModels.forEach(model => {
		if (model.name.includes('重回帰')) {
			if (enableMultiRegr) {
				sleepDurations[model.name] = model.f(awakeDuration, selectedDayOfWeek);
				enabledModels.push(model);
			}
		} else {
			sleepDurations[model.name] = model.f(awakeDuration);
			enabledModels.push(model);
		}
	});

	// Calculate ReLU mean only from visible models
	infSleepDurationMean = enabledModels.reduce((acc, model) => {
		let sleepDuration = sleepDurations[model.name];
		if (sleepDuration < 0) sleepDuration = 0;
		return acc + sleepDuration;
	}, 0) / enabledModels.length;

	resultsTableBody.innerHTML = enabledModels
		.map((model) => {
			const name = model.name;
			return `<tr${name.includes('重回帰') ? ' class="highlight"' : ''}>
	<td>${name}</td>
	<td>${convertHoursToHm(sleepDurations[name])}</td>
	<td>${model.r2.toFixed(4)}</td>
	<td>${model.adjR2.toFixed(4)}</td>
</tr>`;
		}).join('') + `<tr>
	<td><abbr title="1/n ∑max(0, xᵢ)">ReLU の平均</abbr></td>
	<td>${convertHoursToHm(infSleepDurationMean)}</td>
	<td></td>
	<td></td>
</tr>`;
}

function updateAll() {
	updateResults();

	// 3600000 = 60 * 60 * 1000
	const futureDate = new Date((new Date()).getTime() + infSleepDurationMean * 3600000);
	// 0 <= futureHour < 24
	const futureHour = futureDate.getHours() + futureDate.getMinutes() / 60;
	updateEnv(futureHour);
}

function setStats() {
	const stats = [
		['標本数', STATISTICS.nSamples],
		['最終更新日', STATISTICS.date],
		['相関係数', STATISTICS.corr],
		['p値', STATISTICS.pVal.toFixed(16)]
	];

	// Variable Statistics
	const awakeStats = STATISTICS.variableStats.awakeStats;
	const sleepStats = STATISTICS.variableStats.sleepStats;
	[['覚醒時間', awakeStats], ['睡眠時間', sleepStats]]
		.map(pair => {
			const prefix = pair[0] + 'の';
			const stats = pair[1];
			return [
				[prefix + '平均', stats.mean + '時間'],
				[prefix + '中央値', stats.median + '時間'],
				[prefix + '標準偏差', stats.stdDev + '時間'],
				[prefix + '最小値', stats.min + '時間'],
				[prefix + '最大値', stats.max + '時間'],
				[prefix + '第1四分位数', stats.q1 + '時間'],
				[prefix + '第3四分位数', stats.q3 + '時間']
			];
		})
		.forEach(arr => stats.push(...arr));

	// Regression Models
	STATISTICS.regrModels.forEach(model => {
		stats.push([model.name + 'の関数（回帰式）', model.f]);
		stats.push([model.name + 'のR²', model.r2]);
		stats.push([model.name + 'の補正R²', model.adjR2]);
	});

	statsTableBody.innerHTML = stats
		.map(stat => `<tr><td>${stat[0]}</td><td>${stat[1]}</td></tr>`).join('');
}

// Other

// Initialize default values.
input.value = STATISTICS.variableStats.awakeStats.mean.toFixed(1);
toggleSwitch.checked = false;
select.value = getCurrentDayOfWeek();
updateAll();
setStats();

input.addEventListener('input', updateAll);
toggleSwitch.addEventListener('change', () => {
	updateAll();
	if (toggleSwitch.checked) document
		.querySelectorAll('tr.highlight')
		.forEach(e => e.classList.add('glow-anim'));
});
select.addEventListener('change', updateAll);
