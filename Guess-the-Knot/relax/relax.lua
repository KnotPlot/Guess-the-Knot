--[[

rob scharein
Sunday, 2026 April 12, 10:02:23 PDT

--]]


if demo ~= luaSource then
  demo = luaSource
  executeKP ([[
    reset all
    txt on
    txt clobber on
    mode cb
    %tfunc .2 <winfo.kps
    alias dnap "display true;nap .1"
    %duc = true
    alias update "lua . startingKnot = '$0' update() "
  ]])

  Demo ()
  Title ("relax")

  BotButton ('rerun', 'lua rerun')
  firstcall = true
  

end   -- end of init block

function message (m)
  echoKP (m)
  print (m)
end

if tonumber (captureKP ('screens -n')) == 3 then
  winfo = mlcaptureKP ('winfo -s')
  if tonumber (winfo [1][5]) >= 0 then
    executeKP ('tfunc .2 <winfo.kps')
  end
end

ButtonHelp ()
ButtonStack ("toggle:"
          .. ",grid,show ~grid"
          .. ",draw mode,lua . ToggleDrawingMode ()"
          .. ",fullscreen,fullscreen toggle"
            )
            
ButtonStack ('relax:'
          .. ',test,lua . testRelax()'
            )
            
function testRelax ()
  executeKP ([[
    load Monster-r.k
    display true
    nap 1
    timer start
    go
    panel draw
    tfunc 25 "go 0;panel draw;par iter;timer check"

  ]])
end


ButtonStack ("action:"
          .. ",load,knot number \\ri[1/36]"
          .. ",monster,load monster.k"
          .. ",notmonster,load notmonster.k"
          .. ",refine,lua . refine()"
          .. ",refine all,lua . refineAll()"
          .. ",update,lua . update ()"
            )

-- be careful of case!  Linux systems are case senstive

knot = explode (' ', "Monster NotMonster PerkoA PerkoB Swirly octa 0.1 3.1 4.1 5.1 5.2 6.1 6.2 6.3 7.1 7.2 8.1 9.1 9.2 9.42 10.123 Square Granny 19xing-unknot 31xing-unknot goeritz Lorenz-xxyxyy Lorenz-xxyyyxxyx Ash2243 buddhist-knot bain6b NonTrivialAlexander mt-unknot TrueLoveKnot FalseLoversKnot zero-writhe-tref lissa trefA 19nh Ash2445 10may23ay 10may23i 24jan24c 24jan24d")

badknots = " Freedman 17jul23cd"
startingKnot = '17jul23cd'
startingKnot = '3.1'
scale = 1
startingKnot = 'buddhist-knot'
startingKnot = 'Monster'
--startingKnot = '6.3'



knotColour = {
  ['PerkoA'] = 'MediumPurple',
  ['PerkoB'] = 'MediumPurple',
  ['Square'] = 'DodgerBlue',
  ['Granny'] = 'DodgerBlue',
  ['TrueLoveKnot'] = 'red',
  ['FalseLoversKnot'] = 'grey',
  ['19xing-unknot'] = 'OrangeRed',
  ['31xing-unknot'] = 'OrangeRed',
  ['goeritz'] = 'OrangeRed',
  ['mt-unknot'] = 'OrangeRed',
  ['Lorenz-xxyxyy'] = 'LithuanianYellow',
  ['Lorenz-xxyyyxxyx'] = 'LithuanianYellow'
}


function refine (length)
  if length == nil then length = 2 end
  local com = 'refine'
  if paramKP ('nbeads') < 12 then com = 'noop' end
  
  executeKP (length, captureKP ('id'), com, [[
    ARG3 9
    display true
    nap .1
    meta -info
    meta refine ARG1
    echo refine equi ARG1
    meta "knot ID" ARG2
    ARG3 equi ARG1
  ]])
end

function set_nbeads ()
  executeKP (paramKP ('nbeads'), paramKP ('ncomps'),[[
     meta nbeads ARG1
     meta ncomps ARG2
  ]])
end

lastloaded = ''

function setName ()
  local name = captureKP ('name')
  if name == 'knot is not named' then
    name = 'the knot ' .. lastloaded
  else
    --print ('name ', name, #name)
    if charAt (name, #name) == "." then
      name = string.sub (name, 1, -2)
      --print (">>>" .. name .. "<<<<")
    end
  end
  executeKP ('meta name "' .. name .. '"')
end
  
function t (s)
  local t = '.'
  print ('\nlooking in ' .. s .. ' for >>' .. t .. '<<')
  local i, j = string.find (s, '.')
  print (i, j)
end

maxnbeads = 0
maxnbeadsKnot = ''

function refineAll ()
  array = '\n\nconst knots = ['

  for i = 1, #knot do
    Title (knot [i])
    
    lastloaded = knot [i]
  
    array = array .. '"' .. knot [i] .. '-r.k' .. '"'
    if i < #knot then array = array .. ',' end
    
    if knot [i] == startingKnot then
      startingKnotIndex = i - 1
      SubTitle ('starting knot: ' .. knot [i])
    end
    
    if type (tonumber (knot [i])) == "number" then
      append = ""
    else
      append = ".k"
    end
    
    colour = knotColour [knot [i]]
    if colour == nil then colour = 'KnotPlotOrange' end
    
    refinedKnot = knot [i] .. "-r.k"
    if not FileExists (refinedKnot) then
      executeKP (knot [i], append, refinedKnot, scale, colour, [[
        echo --- making ARG3 ----
        echo load ARG1ARG2
        echo -f
        load ARG1ARG2
        lua . setName ()
        lua . refine()
        display true
        nap .1
        lua . set_nbeads ()
        scale ARG4
        meta scale ARG4
        shift maxx
        colour all ARG5
        echo save ARG3
        save ARG3
        echo -f
      ]])
    else
      executeKP ('load ' .. refinedKnot)
    end
    
    nbeads = paramKP ('nbeads')
    --print (maxnbeads)
    if nbeads > maxnbeads then
      maxnbeads = nbeads
      maxnbeadsKnot = 'not set yet'
    end
    --maxnbeads = math.max (nbeads, maxnbeads)
    
  end
  
  params = "\n\nvar params = {\n  'knot': '" .. knot [startingKnotIndex + 1] .. "'\n}\n\n"

  array = array .. '];\n\n\nvar startingKnotIndex = ' .. startingKnotIndex .. ';'

  Title ('starting knot is ' .. startingKnot)
  SubTitle (' ')  -- fix when argument is the zero length string
end

function make (k)
  for i = 1, #knot do
    print (i, knot [i], type (tonumber (knot [i])))
  end
end


message ('------------ ' .. captureKP ('date'))


js = "\n\nvar relaxVersion = '" .. osx ('date.php') .. "'\n\n"  

js = js .. "// created " .. captureKP ('date') .. " by running the relax.lua script in the relax sub-directory\n\n"

js = js .. 'const KNOTS = {\n'

for i = 1, #knot do
  js = js .. ' ' .. "'" .. knot [i] .. "':'" .. knot [i] .. "-r.k'"
  if i == #knot then
    js = js .. '\n};'
  else
    js = js .. ','
  end
end


--print (js)

function message (m)
  echoKP (m)
  EphemeralMessage (m)
end

refineAll ()

js = js .. '\n\nvar maxnbeads = ' .. maxnbeads .. ';'

function update ()
  message ('version.js updated')
  local file = io.open ("version.js", "w")
  array = array .. params
  file:write (js .. array .. 'export {relaxVersion, KNOTS, knots, startingKnotIndex, params, maxnbeads}\n')
  file:close ()
end
  


requireKPbuild (5121)

