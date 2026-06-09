#!/opt/local/bin/php
<?php

date_default_timezone_set ('America/Vancouver');

   
function doit ($com) {
  print "$com\n";
  system ($com);
}

$long ['r'] = 'recto';
$long ['v'] = 'verso';

printf ("var kellsImage = new Map();\n");

foreach (glob ("????.tif") as $kells) {
  list ($w, $h) = getimagesize ($kells);
  $folio = basename ($kells, ".tif");
  $num = intval (substr ($folio, 0, 3));
  $rv = $folio [3];
  $folio = substr ($folio, 0, 3);
  //printf ("%s,%s,%d,%d\n", $kells, $num . $rv, $w, $h);
  printf ("kellsImage.set('%s', ['%s', %d, %d]);\n", $kells, $num . $rv, $w, $h);
}


?>
