--[[

rob scharein
Saturday, 2026 March 28, 17:57:35 PDT

--]]


if demo ~= luaSource then
  demo = luaSource
  executeKP ([[
    reset all
    txt on
    txt clobber on
    vscale = .12
    frame command "lua . combine (%d, 25)"
  ]])

  Demo ()
  Title ("movies")

  BotButton ('rerun', 'lua rerun')
  firstcall = true

end   -- end of init block

ButtonHelp ()
ButtonStack ("toggle:"
          .. ",grid,show ~grid"
          .. ",draw mode,lua . ToggleDrawingMode ()"
          .. ",fullscreen,fullscreen toggle"
            )
	    
movie = dirKP ('*.kpm')

executeKP ('clear')

for i = 1, #movie do
  executeKP (movie [i], string.sub (movie [i], 1, -5), [[
    movie load ARG1 ARG2
    movie time ARG2 3
    %movie atend ARG2 "lua . save(1);lua . save(199)"
  ]])
end
executeKP ('movie list')

stack = "play:"
for i = 1, #movie do
  m = string.sub (movie [i], 1, -5)
  stack = stack ..
     "," .. m .. ",lua . play('" .. m .. "')"
end
print ('\n\n\n' .. stack)

ButtonStack (stack)

ButtonStack ("action:"
          .. ',save,lua . save("$0")'
          
             )


function combine (frameNumber, space)  -- space of 25
  executeKP (frameNumber, space, string.format ("%03d", frameNumber), [[
    movie set compact1
    movie show ARG1
    save |l
    movie set compact2
    movie show ARG1
    translate ARG2 0 0
    save |r
    load |l
    load combine |r
    centre
    colour all KnotPlotOrange
    mcyl on
    mcyl all 0.33
    save compact/ARG3.k LOCS
  ]])
end



function play (m)
  lastplay = m
  Title (m)
  executeKP (m, [[
    echo movie play ARG1
    movie play ARG1
  ]])
end

function save (f)
  SubTitle ('frame ' .. f)
  executeKP (f, lastplay, [[
    echo movie show ARG1
    movie show ARG1
    display true
    save ARG2-ARG1.k
  ]])
end


function fm ()
  local s = 1.86
  executeKP (s, 'movie set Freedman; movie show 1;scale ARG1')
  
  for i = 1, 196, 5 do
    executeKP (string.format ("%03d.k", i),
               string.format ("%.0f", 132 * i / 196), s, [[
      movie show ARG2
      scale ARG3
      mcyl on
      mcyl all .5
      colour all violet
      display true
      nap .1
      
      echo save Freedman/ARG1
      save Freedman/ARG1
    ]])
  end
end



function perko ()
  executeKP ([[
    movie set Perko1
    
  
  ]])
  
  local p = 1
  
  for i = 1, 19 do
    
    Title ('frame ' .. i)
    executeKP (i, string.format ("%03d", p),
                  string.format ("%03d", p + 5), [[
      movie show ARG1

      mcyl on
      mcyl all .33
      colour all EricRawdonBlue
      display true
      nap .1
      save perko/ARG2.k
      save perko/ARG3.k

    ]])
    p = p + 10
  end
end


requireKPbuild (5119)  -- for `movie set MOVIENAME'


if firstcall then
  firstcall = false
end

function test ()
  -- doesn't work!!  use cat
  executeKP ([[
    movie new 2
    movie set 2
  ]])

  for f = 1, 199 do
    SubTitle (f)
    executeKP (f, [[
      load monster/ARG1.k
      display true
      nap .02
      movie add
    ]])
  end
  executeKP ('movie save 2.kpm')
end
