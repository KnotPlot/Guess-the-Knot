#!/opt/local/bin/php
<?php

date_default_timezone_set ('America/Vancouver');

   
function doit ($com) {
  print "$com\n";
  system ($com);
}

foreach (glob ("*.html") as $h) {
  $old = "old/$h";
  doit ("diff " . $h . " " . $old);
}

foreach (glob ("*.js") as $h) {
  $old = "old/$h";
  doit ("diff " . $h . " " . $old);
}

?>
