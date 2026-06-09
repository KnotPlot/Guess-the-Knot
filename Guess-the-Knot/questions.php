#!/opt/local/bin/php
<?php

date_default_timezone_set ('America/Vancouver');

   
function doit ($com) {
  print "$com\n";
  system ($com);
  
}

$qu = explode ("\n", file_get_contents ("questions.csv"));
//print_r ($qu);

for ($i = 0; $i < count ($qu); $i++) {
  $s = explode (",", $qu [$i]);
  if (count ($s) != 2)
    continue;

  printf ("question.set ('%s', \"%s\");\n", $s [0], $s [1]);
}

?>
