--[[

rob scharein
Thursday, 2026 April 30, 15:48:10 PDT

--]]


if demo ~= luaSource then
  demo = luaSource
  executeKP ([[
    reset all
    txt on
    txt clobber on
    alloc comp 1022
    alloc 102200
    ortho
    celtic diag
    celtic copy
    background = black
    sradius = 0.16
    vscale = .0592
    cmode -1
    cmode 3 1 1
    load 14sep04a.k
  ]])

  Demo ()
  Title ("penrose")

  firstcall = true

end   -- end of init block

ButtonHelp ()
ButtonStack ("toggle:"
          .. ",grid,show ~grid"
          .. ",draw mode,lua . ToggleDrawingMode ()"
          .. ",fullscreen,fullscreen toggle"
            )
	    
ButtonAutoHide (5, 7)

function example ()

  local function trial ()
    -- do something
  end
  
  local function check ()
    -- check so see if some condition is successfully achieved
    --return true   -- condition met, stop doing trials
    return false  -- condition not met, keep going with trials
  end
  
  local function statusCallback (timeTaken, numberTrials, success)
  end

  DoUntil (trial, check,
           0,   -- time limit in seconds, 0 means no limit
	   statusCallback)
end


requireKPbuild (5122)


if firstcall then
  firstcall = false
end


--[[

BEGIN HELP
some helpful text should go here...



some helpful text should go here...



some helpful text should go here...
END HELP

--]]
