--[[

rob scharein
Friday, 2026 April 10, 16:18:33 PDT

--]]


if demo ~= luaSource then
  demo = luaSource
  executeKP ([[
    reset all
    txt on
    txt clobber on
    mode cb
    show grid labels orientation
    ortho
    unknot 4
    about z -45
    fitto 10
    load test2.k
    load alex1.k
    load goeritz.k
    load monster.k
    load notmonster.k
    load lor.k
    vscale = 0.3
    tfunc 1 <winfo1.kps
    %tfunc 1 <winfo2.kps
  ]])

  Demo ()
  Title ("conv")

  BotButton ('rerun', 'lua rerun')
  firstcall = true

end   -- end of init block

require "Vector"

ButtonHelp ()
ButtonStack ("toggle:"
          .. ",grid,show ~grid"
          .. ",draw mode,lua . ToggleDrawingMode ()"
          .. ",fullscreen,fullscreen toggle"
            )
ButtonStack ("action:"
          .. ",output,lua . output()"
            )


kpTL = Vector.new (-10, 10, 0)
kpBR = Vector.new (10, -10, 0)
jsTL = Vector.new (0, 0, 0)
jsBR = Vector.new (400, 400, 0)

scale = (jsBR.x - jsTL.x) / (kpBR.x - kpTL.x)

json = ''

xing = mlcaptureKP ('crossings')
xingInfo = ''

for i = 1, #xing do
  xi = xing [i]
  p3 = tonumber (xi [3])
  p4 = tonumber (xi [4])
  min = math.min (p3, p4)
  max = math.max (p3, p4)
  
  xingInfo = xingInfo .. '"' .. min .. ',' ..
                                max .. '":'
    
  if xi [10] == -1 then
    tf = true
  else
    tf = false
  end
  if max == p4 then tf = not tf end
  
  xingInfo = xingInfo .. tostring (tf)
  
  
  if i < #xing then
    xingInfo = xingInfo .. ','
  end
end
  
function output ()
  c = mgetComponentKP (0)
  
  json = '[['
  
  print ('\n')
  
  
  for i = 1, #c do
    v = (kpTL - c [i]) * scale
    x = -string.format ("%.0f", v.x)
    y = string.format ("%.0f", v.y)
    j = '[' .. x .. ',' .. y .. ']'
    if i == 1 then first = j end
    
    json = json .. j .. ','

  end
  json = json .. first .. '],{' .. xingInfo ..  '}]'
end

output ()
print ('------' .. captureKP ('date'))

print (json)

requireKPbuild (5120)  -- for crossings command output to stdout


--[[

L^-2 + 3 + L^2 - M^2L^-2 - 3M^2 - M^2L^2 + M^4
+1/l^2-1m^2/l^2+3-3m^2+1m^4+1l^2-1l^2m^2

-1/a^2-1z^2/a^2+3+3z^2+1z^4-1a^2-1a^2z^2
( -a^-2 + 3-a^2 ) + z^2.( -a^-2 + 3-a^2 ) + z^4


8_2
-3L^2 - 3L^4 - L^6 + 4M^2L^2 + 7M^2L^4 + 3M^2L^6 - M^4L^2 - 5M^4L^4 - M^4L^6 + M^6L^4

-3l^2 + 4l^2m^2 - l^2m^4 - 3l^4 + 7l^4m^2 - 5l^4m^4 + l^4m^6 - l^6 + 3l^6m^2 - l^6m^4

--]]
