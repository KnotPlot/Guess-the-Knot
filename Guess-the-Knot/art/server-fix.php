#!/opt/local/bin/php
<?php

date_default_timezone_set ('America/Vancouver');

   
function doit ($com) {
  print "$com\n";
  system ($com);
}


foreach (glob ("*.tif") as $tif) {
  $jpg = basename ($tif, ".tif") . ".jpg";
  doit ("cp $tif $jpg");
}

?>
