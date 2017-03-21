(function () {

	var storageKey = 'NFLROSTER';
	var players = [];
	var results = [];
	var team = [];

	$.getJSON('https://raw.githubusercontent.com/BoiseCodeWorks/EveningWebDev/master/data/players.json', function (data) {
		players = data.body.players;
		initialize();
	});

	function initialize() {

		$('#searchBtn').on('click', function () {
			findPlayers();
		});

		$('#searchTerm').on('keypress', function (event) {

			if (event.keyCode === 13) {
				event.preventDefault();
				findPlayers();
			}
		});


		$('#searchResults').on('click', 'button', function () {

			var id = $(this).closest('.thumbnail').attr('id');

			addPlayer(id);
		});

		$('#searchResults').on('dragstart', '.playerCard', function (event) {

			var id = $(this).find('.thumbnail').first().attr('id');

			event.originalEvent.dataTransfer.setData('player', id);
			console.log(event);
		});

		$('#teamList').on('click', 'button', function () {

			var id = $(this).closest('.thumbnail').attr('id');
			var index = team.findIndex(function (item) {
				return item.id === id;
			});

			if (index > -1) {
				team.splice(index, 1);
				showTeam();
				saveToLocalStorage();
			}
		});

		$('#teamList').on({
			dragover: function (event) {
				event.preventDefault();
			},
			drop: function (event) {
				var playerId = event.originalEvent.dataTransfer.getData('player');
				event.preventDefault();
				addPlayer(playerId);
			}
		});
		
		loadFromLocalStorage();
		showTeam();

		function addPlayer(playerId) {

			var index = results.findIndex(function (item) {
				return item.id === playerId;
			});

			if (index > -1) {
				team.push(results[index]);
				results.splice(index, 1);
				showTeam();
				showResults();
				saveToLocalStorage();
			}
		}	
		
		function showResults() {

			var resultList = $('#searchResults');

			resultList.empty();

			results.forEach(function (player) {
				resultList.append($(createPlayerHtml(player, 'Add')));
			});
		}

		function showTeam() {

			var teamList = $('#teamList');

			teamList.empty();

			var offense = team.filter(function (player) {
				return 'QB, WR, TE, RB, FB, OL'.includes(player.position);
			});
			
			var defense = team.filter(function (player) {
				return 'LB, DL, DB'.includes(player.position);
			});
			
			var special = team.filter(function (player) {
				return 'K, P'.includes(player.position);
			});
			
			teamList.append($('<div class="text-center"><h3>Offense</h3></div>'));
			offense.forEach(function (player) {
				teamList.append($(createPlayerHtml(player, 'Remove')));
			});

			teamList.append($('<br><br><div class="text-center"><h3>Defense</h3></div>'));
			defense.forEach(function (player) {
				teamList.append($(createPlayerHtml(player, 'Remove')));
			});

			teamList.append($('<br><br><div class="text-center"><h3>Special Teams</h3></div>'));
			special.forEach(function (player) {
				teamList.append($(createPlayerHtml(player, 'Remove')));
			});
		}

		function findPlayers() {

			var term = $('#searchTerm').val();

			if (term) {

				var teamIds = team.map(function (item) {
					return item.id;
				}).join(',');

				results = players.filter(function (item) {
					return (item.fullname.toLowerCase().includes(term.toLowerCase())
						|| item.pro_team.toLowerCase().includes(term.toLowerCase())
						|| item.position.toLowerCase().includes(term.toLowerCase()))
						&& !teamIds.includes(item.id);
				});

				showResults();
			}	
		}

		function createPlayerHtml(player, action) {

			return $('#playerTemplate').html()
				.replace(/{{ id }}/g, player.id)
				.replace(/{{ photo }}/g, player.photo)
				.replace(/{{ fullname }}/g, player.fullname)
				.replace(/{{ position }}/g, player.position)
				.replace(/{{ pro_team }}/g, player.pro_team)
				.replace(/{{ jersey }}/g, player.jersey || 'NA')
				.replace(/{{ action }}/g, action);
		}

		function saveToLocalStorage() {
			localStorage.setItem(storageKey, JSON.stringify(team));
		}

		function loadFromLocalStorage() {
			team = JSON.parse(localStorage.getItem(storageKey) || '[]');
		}
	}
})();