# Motion Language And Aesthetic Rules

This file is loaded by SKILL.md only when its topic is relevant.

## Motion Mode

### Dynamic Cinematic Motion

Use this when the user asks for stronger motion, cinematic energy, action, non-static output, or says the result is stiff.

Requirements:

1. Give every shot at least two motion layers: motivated camera movement, actor body movement, foreground parallax, environmental response, object movement, secondary motion, cloth/hair movement, or focus shift.
2. Give camera movement a clear start point, path, speed, and end frame: low foreground push-in, lateral track past an occluder, handheld micro-sway, over-shoulder orbit, crane drop, overhead pullback, snap pan into a reaction, fast dolly-in ending on the face.
3. Give actor movement physical direction: anticipation, weight shift, body momentum, delayed reaction, step forward/back, shoulder twist, hand reaching path, head turn, eye-line shift, torso recoil, object grab/release, breath-driven chest movement, sleeve or hair follow-through.
4. Add parallax and environmental response: foreground object/body edge close to camera, middle-ground actor readable, background sliding at different speed, dust/fabric/tableware/coins/leaves/curtains/water/light/smoke responding to motion.
5. End each shot on a stable pose, fixed gaze, object contact, or emotional beat for the last 0.5-1 second.

### Controlled Natural Motion

Use this for dialogue-heavy scenes, calm conversations, or when output should not feel overdramatic.

Requirements:

1. Keep camera motion slow-to-medium and observational: gentle push-in, slow lateral slide, small over-shoulder adjustment, mild handheld breathing, short focus pull.
2. Keep actor motion restrained: anticipation, small weight shift, delayed reaction, hand reach, cup/prop contact, half-step, shoulder settling, eye-line change, breathing, fingers tightening, sleeve/hair follow-through.
3. Use parallax lightly: foreground table edge, cup, sleeve, shoulder, doorway, curtain, dust, candlelight, or smoke may move subtly without hiding faces.
4. Show emotion through pauses, eye contact, posture, breathing, hand hesitation, and restrained facial change.
5. Prefer 2-3 longer shots over many rapid cuts for quiet dialogue.
6. Avoid combat-like verbs unless requested. Replace “快速/猛然/冲出/爆发/急速/甩出” with “缓慢/轻微/短暂停顿/克制/自然/稳定/逐渐/轻轻” when calmer motion is needed.

### Aesthetic Non-Combat Cutscene Motion

Use this for lyrical, beautiful, non-combat cutscenes, emotional character moments, scenic transitions, memory-like moments, quiet travel, or Wuthering Waves-like graceful cinematics.

Core rhythm: `slow breathing motion -> graceful silhouette -> camera companionship -> environment carries emotion -> purposeful gesture -> lingering pause`.

Rules:

1. Give movement a breathing quality. Do not rush completion. Add a small pause before looking up, a soft weight shift before turning, hand movement that follows an arc instead of a straight line, and cloth/hair follow-through that lags half a beat behind the body.
2. Prioritize beautiful posture lines. Favor side angles, three-quarter turns, S-curves, diagonal body dynamics, elegant arm/hem/hair arcs, readable silhouettes, and non-rigid standing, turning, reaching, stepping, or looking-back poses.
3. Let the camera accompany the action instead of attacking the viewer. Use slow push-in, slight orbit, follow-turn movement, focus rack from soft foreground to eyes, slow move from back view to side face, and foreground occlusion from flowers, rain, light, hair, fabric, or drifting dust.
4. Make the environment participate in the emotion. Use wind moving clothes and hair, water reflections, petals, snow, rain, floating dust light, backlight through the body outline, and slow background parallax to wrap the character in the scene.
5. Give every beautiful action an emotional purpose. Looking back can mean hesitation, memory, or being drawn toward something; reaching can mean wanting to touch or keep something; lowering the head can mean tenderness, loss, or thought; closing the eyes can mean release, memory, or sensation; slow walking can mean solitude, resolve, or approach.
6. Preserve stillness after the motion. Let the action finish but keep emotion alive for 0.5-1.5 seconds through moving wind, changing light, drifting particles, music, breath, or a held gaze.
7. Avoid empty posing. If a pose is beautiful, anchor it to gaze direction, hand intention, breath change, environmental response, and a stable emotional landing.

Good wording pattern:

```text
非战斗唯美过场节奏，动作慢一点、柔一点、不断掉；先让角色停顿半拍再抬头，身体重心轻轻转移，手臂沿弧线伸出，衣摆和头发慢半拍跟随。镜头缓慢推近并轻微环绕，从前景花瓣/雨丝/光影遮挡中由虚到实对焦到侧脸；风、光、水面反射和漂浮尘光同步包住角色。动作结束后停留一秒，角色不再大动，但风和光还在流动，情绪继续延续。
```


## Detail Expansion Rule

For each important action, describe:

`eye-line path -> hand starting point -> micro action -> prop contact/movement -> final position -> emotional change`

Use concrete promptable details:

- fingers pressing coins
- sleeve movement
- cup edge being touched
- pouch stopping near a hand
- jar lightly shaking but staying fixed
- delayed gaze shifts
- breath changes
- shoulder settling
- hand hesitation
- secondary cloth/hair motion

When a character hands over money, pushes an object, reaches toward a prop, or finishes a major action, complete the action cycle: hand starts, object is released or stopped, fingers loosen, hand withdraws or settles, shoulders/breath change, and the next reaction begins only after the final position is visible.


## Restrained Showcase Shot Rule

Every dialogue segment needs at least one restrained showcase shot. The shot must support dialogue and preserve spatial continuity.

Use one of:

- low tabletop slide
- foreground cup occlusion reveal
- focus rack from prop to eyes
- overhead table reveal
- slow orbit around a stable table axis
- parallax push through foreground props
- camera from hand action back to face
- warm light sliding across sleeve, hair, or fixed prop

Avoid:

- combat-like staging for quiet dialogue
- excessive fast push/pull
- meaningless rotation
- sudden spatial reset
- showcase shots that make dialogue unreadable


## Non-Sexual Female Costume / Upper-Body Detail

Allow occasional non-sexual upper-body costume/detail emphasis only when it supports identity, emotion, clothing design, or story staging. Use it sparingly, at most once every four generated prompts unless the user explicitly asks otherwise.

Allowed focus:

- costume layering
- collar pattern
- shawl or coat folds
- pendant or chest-front ornament
- emblem or embroidery
- arm-crossing posture
- hand-to-collar or hand-to-shawl motion
- shoulder tension
- breath-driven emotional restraint

Do not write sexualized body-part emphasis. Avoid “突出胸部”, “强调胸口曲线”, “胸部特写”, “性感”, “诱惑”, “丰满”, or any wording that makes a body part the visual selling point. Keep faces, eyes, hands, costume, props, and dialogue performance as the primary focus.

Safe examples:

```text
镜头短暂掠过胸前挂坠与衣领纹样后回到眼神。
抱臂动作带动披肩褶皱轻微收紧。
呼吸压住情绪，衣领和胸前饰品随身体停顿轻轻晃动。
```


