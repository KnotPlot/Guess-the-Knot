#!/opt/local/bin/php
<?php

date_default_timezone_set ('America/Vancouver');

   
function doit ($com) {
  print "$com\n";
  //system ($com);
}

/*
foreach (glob ("*.jpg") as $jpg) {
  $tif = basename ($jpg, ".jpg") . ".tif";
  $com = "convert " . $jpg . " -compress jpeg " . $tif;
  doit ($com);
}
*/


foreach (glob ("*.png") as $png) {
  $tif = basename ($png, ".png") . ".tif";
  $com = "convert " . $png . " -resize 1022x -compress jpeg " . $tif;
  doit ($com);
}

?>
