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

winfo = mlcaptureKP ('winfo -s')
if tonumber (winfo [1][5]) >= 0 then
  executeKP ('tfunc .2 <winfo.kps')
end
  

ButtonHelp ()
ButtonStack ("toggle:"
          .. ",grid,show ~grid"
          .. ",draw mode,lua . ToggleDrawingMode ()"
          .. ",fullscreen,fullscreen toggle"
            )
            
ButtonStack ("action:"
          .. ",load,knot number \\ri[1/36]"
          .. ",monster,load monster.k"
          .. ",notmonster,load notmonster.k"
          .. ",refine,lua . refine()"
          .. ",refine all,lua . refineAll()"
          .. ",update,lua . update ()"
            )

-- be careful of case!  Linux systems are case senstive

knot = explode (' ', "Gumby 0.1 3.1 4.1 5.1 5.2 6.1 6.2 6.3 7.1 7.2 8.1 9.1 9.2 9.42 10.123 Square Granny Monster NotMonster PerkoA PerkoB Swirly 19xing-unknot 31xing-unknot goeritz Lorenz-xxyxyy Lorenz-xxyyyxxyx Ash2243 buddhist-knot bain6b NonTrivialAlexander mt-unknot TrueLoveKnot FalseLoversKnot zero-writhe-tref lissa trefA 19nh Ash2445 Freedman 10may23ay 10may23i 17jul23cd 24jan24c 24jan24d")
startingKnot = 'Gumby'

function refine (length)
  if length == nil then length = 2 end
  executeKP (length, captureKP ('id'), [[
    refine 9
    display true
    nap .1
    meta -info
    meta refine ARG1
    echo refine equi ARG1
    meta "knot ID" ARG2
    refine equi ARG1
  ]])
end

function nbeads ()
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
    
    refinedKnot = knot [i] .. "-r.k"
    if not FileExists (refinedKnot) then
      executeKP (knot [i], append, refinedKnot, [[
        echo --- making ARG3 ----
        echo load ARG1ARG2
        echo -f
        load ARG1ARG2
        lua . setName ()
        lua . refine()
        display true
        nap .1
        lua . nbeads ()
        echo save ARG3
        save ARG3
        echo -f
      ]])
    end
    
  end
  
  params = "\n\nvar params = {\n  'knot': '" .. knot [startingKnotIndex + 1] .. "'\n}\n\n"

  array = array .. '];\n\n\nvar startingKnotIndex = ' .. startingKnotIndex .. ';'

  Title ('starting knot is ' .. startingKnot)
  SubTitle ('')
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

function update ()
  message ('version.js updated')
  local file = io.open ("version.js", "w")
  array = array .. params
  file:write (js .. array .. 'export {relaxVersion, KNOTS, knots, startingKnotIndex, params}\n')
  file:close ()
end
  


requireKPbuild (5120)

