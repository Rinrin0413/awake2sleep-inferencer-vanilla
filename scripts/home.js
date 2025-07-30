const STATISTICS = {sampleCount:332,date:'2025-05-16',stats:{awake:{mean:17.573644578358433,stdDeviation:5.629571493129007},sleep:{mean:10.105220883581318,stdDeviation:3.435985519999611},correlation:0.21967948030930193},regrModels:[{name:'4次多項式回帰',f:(x)=>6.455637091184526+0.8306496844164935*x-0.08037903929229682*x**2+0.0032753668542768524*x**3-0.00004334186240824761*x**4,r2:0.05445454910798353},{name:'指数回帰',f:(x)=>7.184055004551228*Math.exp(0.015654242454859867*x),r2:0.05273796811819387},{name:'2次多項式回帰',f:(x)=>8.862558948083242+0.005591467828727637*x+0.003361633254461013*x**2,r2:0.05073305050338839},{name:'線形回帰',f:(x)=>0.1340804560888989*x+7.748938603370822,r2:0.04825907406895735},{name:'累乗回帰',f:(x)=>5.17332021332197*x**0.2149869785378694,r2:0.045039058649980035},{name:'対数回帰',f:(x)=>1.7587249990770417*Math.log(x)+5.168619357712622,r2:0.03759669010492728}]};

const input = document.getElementById('awake-dur-input');
const resultsTableBody = document.getElementById('results');

function updateResults() {
	const awakeDuration = parseFloat(input.value);
	const sleepDurations = STATISTICS.regrModels.reduce(
		(acc, model) => {
			acc[model.name] = model.f(awakeDuration);
			return acc;
		}, {}
	);
	resultsTableBody.innerHTML = STATISTICS.regrModels
		.map((model) => {
			const name = model.name;
			const duration = sleepDurations[name];
			const hours = Math.floor(duration);
			const minutes = Math.round((duration - hours) * 60);
			return `<tr>
	<td>${name}</td>
	<td>${hours}時間${minutes}分</td>
	<td>${model.r2.toFixed(4)}</td>
</tr>`;
		})
		.join('');
}

// Initialize default input value and results.
input.value = STATISTICS.stats.awake.mean.toFixed(1);
updateResults();

input.addEventListener('input', updateResults);

