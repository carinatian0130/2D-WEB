# Weather Space Prop And Continuity Rules

This file is loaded by SKILL.md only when its topic is relevant.

## Weather and Atmosphere Continuity Rule

Choose one weather, time-of-day, and atmosphere setup for the complete dialogue before splitting into 15-second video segments. Apply it across all `===VIDEO_SPLIT===` segments unless the script explicitly calls for a weather change.

Define concise weather anchors in the opening prompt when the scene is outdoors or weather-visible:

- time of day: dawn, noon, sunset, night, moonlit night, storm night
- weather: clear, overcast, drizzle, heavy rain, snow, fog, wind, dust storm, ash fall
- light direction and color: cold moonlight from upper left, warm lantern light from street right, backlit sunset, etc.
- atmosphere particles: rain streaks, drifting snow, dust, smoke, petals, ash, mist
- ground/material state: dry stone, wet reflective street, muddy ground, snow cover, scorched dust

Rules:

1. Do not randomly change clear sky to rain, day to night, dry ground to wet ground, or calm air to storm between splits.
2. Keep weather effects consistent on clothes, hair, ground, props, weapons, monsters, windows, and light reflections.
3. If weather changes for story reasons, describe cause -> visible transition -> final weather state.
4. For indoor scenes, keep outside weather visible through windows/doors consistent and keep indoor light response stable.
5. For battle scenes with dust, smoke, petals, ash, or magic particles, treat them as atmosphere continuity: once introduced, they should persist or dissipate with a stated cause.

Good wording pattern:

```text
全段统一天气：夜间微雨，青灰色冷月光从左上方进入，街面湿润有反光，空气里有细雨和薄雾；后续所有分镜保持同一雨势、地面湿度和光线方向，不要突然变成晴天、白天或干燥地面。
```


## Space and Prop Continuity

Stabilize space before writing motion.

Within each video segment, keep:

- same location
- same table/room/street/gate/path axis when applicable
- same light/background direction
- same weather, time-of-day, atmosphere particles, and ground wetness/dust/snow state
- same prop positions unless an action moves them
- same relative character anchors
- same foreground/midground/background logic

When props matter, define a fixed prop map in the opening or first shot.

Example:

```text
陶罐固定在桌面中央偏右；钱袋靠近委托人前手；钱币散在钱袋旁；茶杯靠近桌边；托盘在[图2]身侧。除非明确写出被碰到、推开、拿起或放下，否则所有道具不漂移、不消失、不换位置。
```

Every prop change must include cause and final state:

`starting point -> contact -> response -> final position`

Example:

```text
[图4]指尖轻触陶罐边缘，罐身短暂晃动，底部摩擦桌面发出轻响，最后仍停在桌面中央偏右。
```


