

var relaxVersion = '2026-06-05 18:00:53 CEST'

// created Fri  5 Jun 2026 09:00:53 PDT by running the relax.lua script in the relax sub-directory

const KNOTS = {
 'Monster':'Monster-r.k', 'NotMonster':'NotMonster-r.k', 'PerkoA':'PerkoA-r.k', 'PerkoB':'PerkoB-r.k', 'Swirly':'Swirly-r.k', 'octa':'octa-r.k', '0.1':'0.1-r.k', '3.1':'3.1-r.k', '4.1':'4.1-r.k', '5.1':'5.1-r.k', '5.2':'5.2-r.k', '6.1':'6.1-r.k', '6.2':'6.2-r.k', '6.3':'6.3-r.k', '7.1':'7.1-r.k', '7.2':'7.2-r.k', '8.1':'8.1-r.k', '9.1':'9.1-r.k', '9.2':'9.2-r.k', '9.42':'9.42-r.k', '10.123':'10.123-r.k', 'Square':'Square-r.k', 'Granny':'Granny-r.k', '19xing-unknot':'19xing-unknot-r.k', '31xing-unknot':'31xing-unknot-r.k', 'goeritz':'goeritz-r.k', 'Lorenz-xxyxyy':'Lorenz-xxyxyy-r.k', 'Lorenz-xxyyyxxyx':'Lorenz-xxyyyxxyx-r.k', 'Ash2243':'Ash2243-r.k', 'buddhist-knot':'buddhist-knot-r.k', 'bain6b':'bain6b-r.k', 'NonTrivialAlexander':'NonTrivialAlexander-r.k', 'mt-unknot':'mt-unknot-r.k', 'TrueLoveKnot':'TrueLoveKnot-r.k', 'FalseLoversKnot':'FalseLoversKnot-r.k', 'zero-writhe-tref':'zero-writhe-tref-r.k', 'lissa':'lissa-r.k', 'trefA':'trefA-r.k', '19nh':'19nh-r.k', 'Ash2445':'Ash2445-r.k', '10may23ay':'10may23ay-r.k', '10may23i':'10may23i-r.k', '24jan24c':'24jan24c-r.k', '24jan24d':'24jan24d-r.k'
};

var maxnbeads = 486;

const knots = ["Monster-r.k","NotMonster-r.k","PerkoA-r.k","PerkoB-r.k","Swirly-r.k","octa-r.k","0.1-r.k","3.1-r.k","4.1-r.k","5.1-r.k","5.2-r.k","6.1-r.k","6.2-r.k","6.3-r.k","7.1-r.k","7.2-r.k","8.1-r.k","9.1-r.k","9.2-r.k","9.42-r.k","10.123-r.k","Square-r.k","Granny-r.k","19xing-unknot-r.k","31xing-unknot-r.k","goeritz-r.k","Lorenz-xxyxyy-r.k","Lorenz-xxyyyxxyx-r.k","Ash2243-r.k","buddhist-knot-r.k","bain6b-r.k","NonTrivialAlexander-r.k","mt-unknot-r.k","TrueLoveKnot-r.k","FalseLoversKnot-r.k","zero-writhe-tref-r.k","lissa-r.k","trefA-r.k","19nh-r.k","Ash2445-r.k","10may23ay-r.k","10may23i-r.k","24jan24c-r.k","24jan24d-r.k"];


var startingKnotIndex = 0;

var params = {
  'knot': 'Monster'
}

export {relaxVersion, KNOTS, knots, startingKnotIndex, params, maxnbeads}
