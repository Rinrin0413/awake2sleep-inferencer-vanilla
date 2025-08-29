// Constants

const STATISTICS = {nSamples:413,date:'2025-08-28',corr:0.29175158040509935,pVal:0.0000000015118892,variableStats:{awakeStats:{mean:18.06908797431477,median:16.91666667,stdDev:6.090319130463955,min:1.1,max:38.8,q1:14.4,q3:20.86666667},sleepStats:{mean:10.066343825690074,median:9.9,stdDev:3.448859879640087,min:2.3,max:20.11666667,q1:7.55,q3:12.46666667}},regrModels:[{name:'線形重回帰',f:(x,dow)=>{dowAdj={Friday:0.,'Monday':2.8512511457188090,'Saturday':-0.3208122449660484,'Sunday':4.4232237868070339,'Thursday':2.0778513624349153,'Tuesday':2.7544181842220610,'Wednesday':2.7766105156927017}[dow];return 0.1595523333102244*x+dowAdj+4.931501652093509},r2:0.3258639741853224,adjR2:0.3136702992997856},{name:'指数回帰',f:(x)=>6.6735643182715325*Math.exp(0.0189958038589796*x),r2:0.08818724474521666,adjR2:0.08596872222634855},{name:'4次多項式回帰',f:(x)=>5.528160014005055+0.8655926036317612*x-0.0765458982205444*(x*x)+0.0030293648215251*(x*x*x)-0.0000393249025689*(x*x*x*x),r2:0.09089029453585928,adjR2:0.08197745428621095},{name:'線形回帰',f:(x)=>0.1652147118937730*x+7.081064661830421,r2:0.08511898466887347,adjR2:0.08289299679702156},{name:'2次多項式回帰',f:(x)=>7.564737941995957+0.1113424383032895*x+0.0013473383718007*(x*x),r2:0.08564375978366245,adjR2:0.08118348544114373},{name:'3次多項式回帰',f:(x)=>7.841709111851278+0.0543277753750433*x+0.0046987187217927*(x*x)-0.0000577787701504*(x*x*x),r2:0.08574978044718029,adjR2:0.07904378861671957},{name:'累乗回帰',f:(x)=>4.3562823712151548*x**0.2721698725706173,r2:0.07869445293316124,adjR2:0.0764528335972322},{name:'対数回帰',f:(x)=>2.2742666600003565*Math.log(x)+3.6340866392458944,r2:0.07011087209818301,adjR2:0.06784836813735129}]};

// Variables
let infSleepDurationMean = 0;

// HTML elements
const input = document.getElementById('awake-dur-input');
const toggleSwitch = document.getElementById('dow-toggle');
const selectContainer = document.getElementById('select-container');
const select = document.getElementById('dow-select');
const resultsTableBody = document.getElementById('results');

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

// Other

// Initialize default values.
input.value = STATISTICS.variableStats.awakeStats.mean.toFixed(1);
toggleSwitch.checked = false;
select.value = getCurrentDayOfWeek();
updateAll()

input.addEventListener('input', updateAll);
toggleSwitch.addEventListener('change', () => {
	updateAll();
	if (toggleSwitch.checked) document
		.querySelectorAll('tr.highlight')
		.forEach(e => e.classList.add('glow-anim'));
});
select.addEventListener('change', updateAll);
