#!/opt/local/bin/php
<?php

date_default_timezone_set ('America/Vancouver');

   
function doit ($com) {
  print "$com\n";
  system ($com);
}

$home = true;
if ($argc == 2)
  $home = false;


if ($home) {
  date_default_timezone_set ('America/Vancouver');
  $date = date ("Y-m-d H:i:s \\P\\D\\T");
}
else {
  date_default_timezone_set('Europe/Warsaw');
  $date = date ("Y-m-d H:i:s \\C\\E\\S\\T");
}

$molecule = glob ("*.pdb");
print_r ($molecule);


$fp = fopen ("version.js", "w");

fprintf ($fp, "// created $date by running script update.php in molecules folder\n\n");
fprintf ($fp, "var moleculesVersion = '$date';\n");
fprintf ($fp, "var initialMolecule = '%s';\n\n", $molecule [0]);
fprintf ($fp, "const MOLECULES = {\n");

for ($i = 0; $i < count ($molecule); $i++) {
  fprintf ($fp, "  '%s': '%s'", basename ($molecule [$i], ".pdb"), $molecule [$i]);
  if ($i < count ($molecule) - 1)
    fprintf ($fp, ",\n");
  else
    fprintf ($fp, "\n}\n\n");
}

fprintf ($fp, "export {moleculesVersion, initialMolecule, MOLECULES}\n");

fclose ($fp);

?>
