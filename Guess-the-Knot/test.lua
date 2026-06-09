--[[

rob scharein
Wednesday, 2026 April 8, 10:11:55 PDT

--]]


if demo ~= luaSource then
  demo = luaSource
  executeKP ([[
    reset all
    txt on
    txt clobber on
    mode cb
    coll a
    alias nnn "display true; nap .2"
    alias r "lua . refine ('$0')"
    vscale = 0.184
    sradius = 0.3
  ]])

  Demo ()
  Title ("test")

  BotButton ('rerun', 'lua rerun')

  firstcall = true

end   -- end of init block

ButtonHelp ()
ButtonStack ("toggle:"
          .. ",grid,show ~grid"
          .. ",draw mode,lua . ToggleDrawingMode ()"
          .. ",fullscreen,fullscreen toggle"
            )

ButtonStack ("action:"
          .. ",test,lua . test()"
            )
            
ButtonStack ("knot:"
          .. ",monster,lua . setKnot('monster')"
          .. ",monster1,lua . setKnot('monster1')"
          .. ",monster2,lua . setKnot('monster2')"
          .. ",compact,lua . setKnot('compact')"
          .. ",compact1,lua . setKnot('compact1')"
          .. ",compact2,lua . setKnot('compact2')"
          .. ",PerkoPair,lua . setKnot('PerkoPair')"
          .. ",PerkoA,lua . setKnot('PerkoA')"
          .. ",PerkoB,lua . setKnot('PerkoB')"
          .. ",Freedman,lua . setKnot('Freedman')"
            )

function setKnot (k)
  knot = k
  Title (k)
  executeKP (knot, [[
    load ARG1.k
  ]])
end

setKnot ('monster')


function test ()
  executeKP (knot, [[
    load ARG1.k
    nnn
    keep 0
    nnn
    centre
  
  ]])
end


function refine (r)
  Title (knot)
  SubTitle ('refine equi ' .. r)
  executeKP (r, knot, [[
    load ARG2.k
    refine 9
    echo refine equi ARG1
    refine equi ARG1
    length
  ]])
end
