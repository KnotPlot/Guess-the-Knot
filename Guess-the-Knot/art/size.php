#!/opt/local/bin/php
<?php

date_default_timezone_set ('America/Vancouver');

   
function doit ($com) {
  print "$com\n";
  system ($com);
}


// thing.jpg, rob/thing.jpg, Decorative Knots - Rob Scharein, 1022, 1022

foreach (glob ("rob/*.jpg") as $jpg) {
  $bname = basename ($jpg, ".jpg");
  list ($width, $height) = getimagesize ($jpg);
  printf ("%s,%s,,%d,%d\n", $bname, $jpg, $width, $height);
}

?>
