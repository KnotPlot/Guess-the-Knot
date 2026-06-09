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

$protein = glob ("*.wrl");
print_r ($protein);

$fp = fopen ("version.js", "w");

fprintf ($fp, "// created $date by running script update.php in proteins folder\n\n");
fprintf ($fp, "var proteinsVersion = '$date';\n");
fprintf ($fp, "var initialProtein = '%s';\n\n", $protein [0]);
fprintf ($fp, "const PROTEINS = {\n");

for ($i = 0; $i < count ($protein); $i++) {
  // need to clear the extened attributes to prevent issues with tar
  // tar file exceeds 128 MB in size and fails to untar
  doit ("xattr -c " . $protein [$i]);
  
  fprintf ($fp, "  '%s': '%s'", basename ($protein [$i], ".wrl"), $protein [$i]);
  if ($i < count ($protein) - 1)
    fprintf ($fp, ",\n");
  else
    fprintf ($fp, "\n}\n\n");
}

fprintf ($fp, "export {proteinsVersion, initialProtein, PROTEINS}\n");

fclose ($fp);



/*

tar: Ignoring unknown extended header keyword 'LIBARCHIVE.xattr.com.apple.provenance'

tar --no-xattrs --no-mac-metadata -cvf archive.tar folder/

tar --exclude='._*' -xvf archive.tar.gz

*/


?>

