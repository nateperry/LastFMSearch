<?php require_once('environments.php'); ?>
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Last.FM Search</title>
	<link rel="icon" type="image/png" href="<?php echo BASE_URL; ?>images/icon.png" />
	<link href='http://fonts.googleapis.com/css?family=Open+Sans:800,600,400,300' rel='stylesheet' type='text/css'>
	<link href="//cdnjs.cloudflare.com/ajax/libs/font-awesome/4.1.0/css/font-awesome.min.css" rel="stylesheet" type="text/css" />
	<link href="<?php echo BASE_URL; ?>css/main.css" rel="stylesheet" type="text/css" />
</head>
<body class="default">
	<a href="#MENU" class="menu-toggle fa fa-stack">
		<i class="fa fa-circle-thin fa-stack-2x"></i>
		<i class="fa fa-gear fa-stack-1x"></i>
	</a>
	<div class="menu">
		<h4>Change Theme</h4>
		<ul class="theme-list">
			<?php foreach (array('default', 'bluegrey', 'red', 'blue', 'violet', 'concrete', 'orange') as $color): ?>
			<li class="theme-option <?php echo $color; ?>" data-theme="<?php echo $color; ?>">
				<div class="preview"></div>
				<span class="theme-name"><?php echo $color; ?></span>
			</li>
			<?php endforeach; ?>
		</ul>
	</div>
	<div id="loader-cta">
		<i id="loader" class="fa fa-spinner fa-spin"></i>
	</div>
	<!-- jQuery library -->
	<script src="//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.1/jquery.min.js" type="text/javascript"></script>
	<script src="//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.6.0/underscore-min.js" type="text/javascript"></script>
	<script src="//cdnjs.cloudflare.com/ajax/libs/moment.js/2.8.2/moment.min.js" type="text/javascript"></script>
	<script src="<?php echo BASE_URL; ?>scripts/main.js" type="text/javascript"></script>
	<!-- Templates -->
	<script id="welcomeTemplate" type="text/html">
		<div id="welcome" class="banner">
			<div class="container inner">
				<h1>Welcome.</h1>
				<p>Please enter the name of a band or artist.</p>
				<form method="POST" class="search-form">
					<input id="initial-search" type="text" name="artist" autofocus="true" />
				</form>
				<small>&lpar; Maybe check out Brick + Mortar, Quiet Company, or Vampire Weekend &rpar;</small>
			</div>
		</div>
	</script>
	<script id="artistTemplate" type="text/html">
		<div class="container">
			<div class="col-wrap">
				<div id="sidebar" class="col-right">
					<div class="banner search-cta">
						<form method="POST" class="search-form">
							<label for="artist">
								<i class="fa fa-search fa-flip-horizontal"></i>
								<input id="search" type="text" name="artist" autofocus="false" />
							</label>
						</form>
					</div>
					<div class="banner profile">
						<img class="artist-image" src="<%= artist.image[artist.image.length - 1]['#text'] %>" alt="<%= artist.name %>" title="<%= artist.name %>" />
						<div class="artist-info">
							<%= artist.name %>
							<% if (artist.bio.yearformed) { %>
							<span class="formed">Formed <%= artist.bio.yearformed %></span>
							<% } %>
							<h4>Last.FM Stats</h4>
							<span><%= artist.stats.listeners %> Listeners</span>
							<span><%= artist.stats.playcount %> Plays</span>
							<% if (typeof(artist.bandmembers) === 'object') { %>
									<h4>Members</h4>
									<ul class="band-members">
									<% _.each(artist.bandmembers.member, function (member) { %>
										<li><%= member.name %></li>
									<% }) %>
									</ul>
							<% } %>
						</div>
					</div>
					<% if (typeof(artist.similar) === 'object') { %>
						<h3>Similar Artists</h3>
						<ul class="sim-artists">
						<% _.each(artist.similar.artist, function(similar) { %>
							<li>
								<a href="<%= similar.url %>" class="sim-artist" data-artist="<%= similar.name.trim() %>">
									<% if ( similar.image[1]['#text'].trim() === '') { similar.image[1]['#text'] = BASE_URL + 'css/defaultband.png'; } %>
									<img class="sim-image" src="<%= similar.image[1]['#text'] %>" alt="<%= similar.name %>" title="<%= similar.name %>" />
									<span class="sim-name-cta"><%= similar.name.trim() %></span>
								</a>
							</li>
							<% }) %>
						</ul>
					<% } %>
				</div>
				<div id="content" class="col-left">
					<h1 class="artist-name"><%= artist.name %></h1>
					<% if (artist.ontour === 1 || artist.ontour === "1") { %>
						<div class="ontour">
							<a href="#" class="button-link tour-link">
								<span class="fa-stack fa-lg tour-symbol">
									<i class="fa fa-circle-thin fa-stack-2x"></i>
									<i class="fa fa-plane fa-stack-1x"></i>
								</span>
								<%= artist.name %> is on tour. Find all their dates here.
							</a>
						</div>
					<% } %>
					<div class="bio"><%= artist.bio.content %></div>
					<div class="tag-cta">
						<h6 class="tag-title">Tags:</h6>
						<ul class="tag-list">
							<% _.each(artist.tags.tag, function(tag) { %>
							<li><a class="tag" href="<%= tag.url %>" target="_blank"><%= tag.name %></a></li>
							<% }) %>
						</ul>
					</div>
					<div id="album-cta"></div>
				</div>

			</div>
			<footer id="footer">
				<p>Artist info courtesy of <a href="//last.fm" target="_blank">Last.FM</a> and the <a href="//last.fm/api" target="_blank">Last.FM API</a><br/>&copy;Nate Perry 2012 - <?php echo date('Y'); ?> All Rights Reserved.</p>
			</footer>
		</div>
	</script>
	<script id="eventsTemplate" type="text/html">
		<div class="container">
			<div class="event-wrap">
			<a href="#" class="back button-link" data-back-to="artist">
				<span class="fa-stack fa-lg tour-symbol">
					<i class="fa fa-circle-thin fa-stack-2x"></i>
					<i class="fa fa-arrow-left fa-stack-1x"></i>
				</span>
				Back to <%= App.currentArtist.artist.name %> info
			</a>
			<% if (events["@attr"].total > 0 || events.event.length > 0 ) { %>
				<h1 class="page-title">Upcoming Events</h1>
				<ul class="event-list">
				<% if (events.event.length === undefined) { %>
						<%= EventViewHelper.displayEvent(events.event) %>
				<% } else {
					_.each(events.event, function (event) { %>
						<%= EventViewHelper.displayEvent(event) %>
				<% }) } %>
				</ul>
			<% } else { %>
				<h1>There are no upcoming events for <%= App.currentArtist.artist.name %></h1>
			<% } %>
			</div>
		</div>
	</script>
	<script id="albumTemplate" type="text/html">
		<ul class="album-grid">
		<% console.log(topalbums); _.each(topalbums.album, function (album) { %>
				<li class="album">
					<% if ( album.image[2]['#text'].trim() === '') { album.image[2]['#text'] = BASE_URL + 'css/defaultband.png'; } %>
					<img src="<%= album.image[2]['#text'] %>" alt="<%= album.name %>" title="<%= album.name %>"
				</li>
		<% }) %>
		</ul>
	</script>
</body>
</html>