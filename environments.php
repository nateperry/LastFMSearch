<?php
DEFINE('ENVIRONMENT', 'production');

date_default_timezone_set('America/New_York');

switch (ENVIRONMENT) {
  case 'development':
    DEFINE('BASE_URL', 'http://localhost/LastFM/');
    break;

  default:
    DEFINE('BASE_URL', 'http://thenateperry.com/projects/LastFM/');
    break;
}
?>