#!/opt/local/bin/php
<?php

date_default_timezone_set ('America/Vancouver');

   
function doit ($com) {
  //print "$com\n";
  system ($com);
}

foreach (array_merge (glob ("*.html"), glob ("*.js")) as $file) {
  $other = "/Users/orb/kpsite/gtk/" . $file;
  if (!file_exists ($other))
    continue;
  printf ("---- $file ----\n");
  doit ("diff $file $other");
}

?>

