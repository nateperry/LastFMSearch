/*
Main.js
Nathaniel Perry
 */

// create globals
var App, Loader, PageInit, Validator, ContentChanger, EventViewHelper, BASE_URL;

if (window.location.host === 'localhost')
  BASE_URL = 'http://localhost/LastFM/';
else
  BASE_URL = 'http://thenateperry.com/projects/LastFM/';

//first object used on load
PageInit = function () {
  App.init();
  App.checkURL();
  if (App.checkLocalStorageSupport())
    App.checkForSavedTheme();
  App.addEventListeners();
};

//main controller for application
App = {
  isSearching : false,
  currentArtist : null,
  currentEvents : null,
  currentAlbums : null,
  currentTheme : null,
  firstSearch : true,
  $body : null,
  $loading : null,
  init : function () {
    this.$body = $('body');
    this.$loading = this.$body.find('#loader-cta');
    $('.menu-toggle').on('click', App.toggleMenu);
    $('.theme-option').on('click', App.changeTheme);
  },
  checkURL : function () {
    if (window.location.pathname.indexOf('/artist/') > -1) {
      var chunks = window.location.pathname.split('artist/');
      var artist = chunks[chunks.length - 1];
      if (artist.trim() !== '') {
        Loader.getArtistFromURL(decodeURIComponent(artist));
      }
    } else {
      ContentChanger.showWelcome();
    }
  },
  checkForSavedTheme : function () {
    var theme = localStorage.getItem('theme');
    (theme !== null)? App.setTheme(theme) : App.setTheme('default');
  },
  checkLocalStorageSupport : function () {
    // source: http://diveintohtml5.info/storage.html
    try {
      return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
      return false;
    }
  },
  addEventListeners : function () {
    $('.search-form').on('submit', Loader.search);
    $('.tour-link').on('click', Loader.getEvents);
    $('.back').on('click', ContentChanger.onBackClick);
    $('.sim-artist').on('click', Loader.getSimArtist);
  },
  scrollToID : function (target) {
    $('html,body').animate({
      scrollTop: $('#'+target).offset().top
    }, 1000);
  },
  changeTheme : function (e) {
    var $target = $(e.currentTarget);
    App.setTheme($target.data('theme'));
  },
  setTheme : function (theme) {
    if (theme !== App.currentTheme) {
      (App.$body === null)? $('body').removeClass(App.currentTheme).addClass(theme) : App.$body.removeClass(App.currentTheme).addClass(theme);
      App.currentTheme = theme;
      $('.theme-option.active').removeClass('active');
      $('.theme-option.' + theme).addClass('active');
      localStorage.setItem("theme", theme);
    }
  },
  toggleMenu : function (e) {
    e.preventDefault();
    if (App.$body.hasClass('open')) {
      App.$body.removeClass('open');
      App.$body.find('#welcome, #main').off('click', App.toggleMenu);
    } else {
      App.$body.addClass('open');
      App.$body.find('#welcome, #main').on('click', App.toggleMenu);
    }
  }
};
//handles loading of content and search results
Loader = {
  search : function (e) {
    e.preventDefault();
    var value = e.target.artist.value;
    if (Loader.searchAvailable && Validator.validateSearch(value)) {
      App.$loading.show();
      Loader.getArtist(value);
    }
  },
  searchAvailable : function () {
    if (App.isSearching === true) {
      alert('Please allow the search to finish before trying again.');
      return false;
    } else {
      return true;
    }
  },
  getSimArtist : function (e) {
    e.preventDefault();
    var value = $(e.currentTarget).data('artist');
    if (Loader.searchAvailable && Validator.validateSearch(value)) {
      Loader.getArtist(value);
    }
  },
  getArtistFromURL : function (value) {
    App.isSearching = true;
    $.ajax({
      async : false,
      crossDomain : true,
      url : 'http://ws.audioscrobbler.com/2.0/',
      data : {
        method : 'artist.getinfo',
        autocorrect : 1,
        api_key : 'a38b69be942b255760b8b2e14cea23bb',
        artist : value,
        format : 'json'
      },
      type : 'POST',
      dataType : 'JSONP',
      success : function (data) {
        console.log(data);
        if (data.error === 6) {
          alert('the artist was not found');
          return false;
        }
        data = Validator.cleanArtistInfo(data);
        ContentChanger.displayArtist(data);
        App.currentArtist = data;
        Loader.getAlbums();
      },
      error : function (jqXHR, status, error) {
        alert('error = ' + error + '\n' + status);
      },
      complete : function () {
        App.isSearching = false;
      }
    });
  },
  getArtist : function (value) {
    App.isSearching = true;
    $.ajax({
      async : false,
      crossDomain : true,
      url : 'http://ws.audioscrobbler.com/2.0/',
      data : {
        method : 'artist.getinfo',
        autocorrect : 1,
        api_key : 'a38b69be942b255760b8b2e14cea23bb',
        artist : value,
        format : 'json'
      },
      type : 'POST',
      dataType : 'JSONP',
      success : function (data) {
        console.log(data);
        if (data.error === 6) {
          alert('the artist was not found');
          return false;
        }
        $('.search-form')[0].reset();
        data = Validator.cleanArtistInfo(data);
        ContentChanger.displayArtist(data);
        App.currentArtist = data;
        if (App.firstSearch === true) {
          App.firstSearch = false;
        }
        Loader.getAlbums();
        // update the history
        window.history.replaceState("", App.currentArtist.artist.name + " | Info", "artist/" + App.currentArtist.artist.name);
      },
      error : function (jqXHR, status, error) {
        alert('error = ' + error + '\n' + status);
      },
      complete : function () {
        App.isSearching = false;
      }
    });
  },
  getAlbums : function () {
    App.isSearching = true;
    $.ajax({
      async : false,
      crossDomain : true,
      url : 'http://ws.audioscrobbler.com/2.0/',
      data : {
        method : 'artist.getTopAlbums',
        autocorrect : 1,
        api_key : 'a38b69be942b255760b8b2e14cea23bb',
        artist : App.currentArtist.artist.name,
        mbid : App.currentArtist.artist.mbid,
        format : 'json'
      },
      type : 'POST',
      dataType : 'JSONP',
      success : function (data) {
        console.log(data);
        if (data.error === 6) {
          alert('the artists albums were not found');
          return false;
        }
        App.currentAlbums = data;
        ContentChanger.displayAlbums(data);
      },
      error : function (jqXHR, status, error) {
        alert('error = ' + error + '\n' + status);
      },
      complete : function () {
        App.isSearching = false;
      }
    });
  },
  getEvents: function (e) {
    e.preventDefault();
    if (App.currentEvents !== null && App.currentArtist.artist.name === App.currentEvents.events['@attr'].artist) {
      ContentChanger.displayEvents(App.currentEvents);
      return false;
    }
    App.isSearching = true;
    $.ajax({
      async : false,
      crossDomain : true,
      url : 'http://ws.audioscrobbler.com/2.0/',
      data : {
        method : 'artist.getEvents',
        api_key : 'a38b69be942b255760b8b2e14cea23bb',
        artist : App.currentArtist.artist.name,
        mbid : App.currentArtist.artist.mbid,
        autocorrect : 1,
        fetivalsonly : 0,
        format : 'json'
      },
      type : 'POST',
      dataType : 'JSONP',
      success : function (data) {
        console.log(data);
        if (data.error === 6) {
          alert('there was an error');
          return false;
        }
        ContentChanger.displayEvents(data);
        App.currentEvents = data;
      },
      error : function (jqXHR, status, error) {
        alert('error = ' + error + '\n' + status);
      },
      complete : function () {
        App.isSearching = false;
      }
    });
  },
  getMap : function (lat, long, id) {
    return $(id).load('getmap.php?lat=' + lat + '&long=' + long);
  }
};
//handles changing of content on page
ContentChanger = {
  displayArtist : function (artist) {
    var template = $('#artistTemplate').html();
    if (App.firstSearch === true) {
      App.$loading.after( _.template('<div id="main">' + template + '</div>', artist));
      $('#welcome').animate({'height': 0}, 1000, 'swing', function (){$(this).remove();});
    } else {
      $('#main').html(_.template(template, artist));
      App.scrollToID('main');
    }
    App.$loading.hide();
    App.addEventListeners();
  },
  displayAlbums : function (albums) {
    var template = $('#albumTemplate').html();
    $('#album-cta').html(_.template(template, albums));
  },
  displayEvents : function (events) {
    var template = $('#eventsTemplate').html();
    $('#content').html(_.template(template, events));
    App.addEventListeners();
    App.scrollToID('main');
    App.$loading.hide();
  },
  onBackClick : function (e) {
    e.preventDefault();
    var dest = $(e.target).data('back-to');
    switch (dest) {
      case 'artist':
        ContentChanger.displayArtist(App.currentArtist);
        ContentChanger.displayAlbums(App.currentAlbums);
        break;
      case 'events':
        ContentChanger.displayEvents(App.displayEvents(App.currentEvents));
    }
  },
  showWelcome : function () {
    var template = $('#welcomeTemplate').html();
    App.$body.prepend(_.template(template));
    App.$loading.hide();
  }
};
//helper to santize and validate data
Validator = {
  validateSearch : function (text) {
    text = text.trim();
    if (text.length > 0) {
      return true;
    } else {
      return false;
    }
  },
  cleanArtistInfo : function (data) {
    //adds p tags to bio
    var bio = "<p>" + data.artist.bio.content.trim() + "</p>";
    bio = bio.replace(/\r\n\r\n/g, "</p><p>").replace(/\n\n/g, "</p><p>");
    bio = bio.replace(/\r\n/g, "<br />").replace(/\n/g, "<br />");
    data.artist.bio.content = bio;
    return data;
  }
};

EventViewHelper = {
  displayEvent : function (event) {
    var month = moment(event.startDate).format('MMM');
    var day = moment(event.startDate).format('D');
    var year = moment(event.startDate).format('YYYY');
    var venueImage = event.venue.image[2]['#text'].trim() === ''?BASE_URL+'css/venuedefault.png':event.venue.image[2]['#text'];
    var html = '';
    html += '<li class="event';
    if (event.cancelled === 1) { html += ' cancelled'; }
    html += '">\n';
    html += '<div class="event-img-cta" style="background-image:url(\'' + venueImage + '\')">\n';
    html +=   '<div class="event-date">\n';
    html +=     '<span class="month">' + month + '</span>\n';
    html +=     '<span class="day">' + day + '</span>\n';
    html +=     '<span class="year">' + year + '</span>\n';
    html +=   '</div>\n';
    html += '</div>\n';
    html += '<div class="event-info-cta">\n';
    html +=   '<h3 class="event-title">' + event.title + '</h3><h3 class="venue">&#64; ' + event.venue.name + '</h3>\n';
    html +=   '<div class="event-info">\n';
    html +=     '<span>' + event.venue.location.city + '</span>\n';
    html +=   '</div>\n';
    html += '</div>\n';
    html += '</li>\n';
    return html;
  }
}

window.onload = PageInit;