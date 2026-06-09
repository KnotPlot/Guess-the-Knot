#!/opt/local/bin/php
<?php


date_default_timezone_set ('America/Vancouver');

$project = "Guess-the-Knot";
$exclude = "update-exclude.txt";

$exclude = " -X $exclude ";

function doit ($com) {
  print "$com\n";
  system ($com);
}


$date = date ("Ymd-H\hi\ms\sT");

$tarball = "/Users/orb/Desktop/$project-$date.tar";
$subdir = str_replace (" ", "\ ", basename (getcwd ()));


$stuff = " * ";


print "tarball is $tarball\nstuff is $stuff\n";


doit ("tar cf $tarball $exclude $stuff");

print ("\n\ntar xf $tarball\ndu -h\n\n");


?>
