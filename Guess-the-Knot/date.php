#!/opt/local/bin/php
<?php


   
function doit ($com) {
  print "$com\n";
  system ($com);
}

$warsaw = true;

if ($warsaw) {
  date_default_timezone_set('Europe/Warsaw');
  print ( date ("Y-m-d H:i:s \\C\\E\\S\\T")  . "\n");
}
else {
  date_default_timezone_set ('America/Vancouver');
  print ( date ("Y-m-d H:i:s \\P\\D\\T")  . "\n");
}


?>
