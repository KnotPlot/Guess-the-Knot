--[[

rob scharein
Sunday, 2026 April 12, 10:53:11 PDT

--]]


if demo ~= luaSource then
  demo = luaSource
  executeKP ([[
    reset all
    txt on
    txt clobber on
  ]])

  Demo ()
  Title ("knots")

  require ('KnotTheory')
  firstcall = true

end   -- end of init block

ButtonHelp ()
ButtonStack ("toggle:"
          .. ",grid,show ~grid"
          .. ",draw mode,lua . ToggleDrawingMode ()"
          .. ",fullscreen,fullscreen toggle"
            )
	    

