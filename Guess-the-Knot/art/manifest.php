#!/opt/local/bin/php
<?php

date_default_timezone_set ('America/Vancouver');

   
function doit ($com) {
  print "$com\n";
  system ($com);
}

$long ['r'] = 'recto';
$long ['v'] = 'verso';
$gallery = explode (" ", "bok lin anni man rob");


$fp = fopen ("manifest.csv", "w");

function bok ($f) {

}

function doGallery ($g) {
  global $fp;
  print ("$g\n");
  $name = rtrim (file_get_contents ("$g/name.txt"));
  foreach (glob ("$g/*.jpg") as $jpg) {
    $fname = basename ($jpg);
    list ($w, $h) = getimagesize ($jpg);
    
    fprintf ($fp, "$fname, $jpg, $name, $w, $h\n");
  }
}

for ($i = 0; $i < count ($gallery); $i++) {
  doGallery ($gallery [$i]);
}

fclose ($fp);


/*

foreach (glob ("????.tif") as $kells) {
  list ($w, $h) = getimagesize ($kells);
  $folio = basename ($kells, ".tif");
  $num = intval (substr ($folio, 0, 3));
  $rv = $folio [3];
  $folio = substr ($folio, 0, 3);
  fprintf ($fp, "%s,%s,%d,%d\n", $kells, $num . $rv, $w, $h);
}

*/

system ("cat manifest.csv");

?>
