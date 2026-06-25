# Storyboard Blueprint And Exact Mimic Rules

This file is loaded by SKILL.md only when its topic is relevant.

## 分镜图 / Storyboard First-Frame Lock Rule

Treat `[图6]` as a hard first-frame image-to-video lock and motion blueprint, not a visible object.

The uploaded storyboard image is a real first-frame reference for video generation. The generated video's first frame must strictly match the current segment opening panel or corresponding visual region: camera height, camera angle, shot size, character left/right/front/back positions, subject scale, foreground occlusion, midground character placement, background spatial anchors, gaze direction, perspective depth, depth of field, light direction, and tonal relationship. Hold that locked composition for the first 0.5-1 second before natural motion begins.

If the storyboard image is a multi-panel sheet, the first panel/opening visual region for the current segment is the first-frame anchor. Later panels guide motion direction, cutting rhythm, path, and ending pose; they are not a collage to display in the generated frame.

Extract internally from `[图6]`:

- composition center
- relative character positions
- camera angle
- shot size changes
- foreground/background layering
- eye-line relationship
- action direction
- hand path
- body turn
- prop contact
- prop collision or vibration
- light direction
- emotional impact
- stable ending pose

Do not reproduce visible storyboard artifacts. Final prompts must not generate arrows, dashed lines, colored marks, panel borders, written notes, numbers, UI, labels, subtitles, or watermarks.

### Exact Composition Mimic Requirement

When the user says to mimic, follow, copy, or match the 分镜图, every generated shot must explicitly lock to the corresponding panel number or visual panel position. Write the prompt as a camera-composition copy, not a loose story adaptation.

For each shot, include direct language equivalent to: `严格复刻上传分镜图第N格的画面构图、camera angle、镜头高度、镜头倾斜、景别、人物左右/前后位置、主体大小比例、前景遮挡、中景人物、背景门窗/墙面/铁栏位置、视线方向和透视纵深；只把箭头/标注翻译成自然动作和镜头运动，不生成箭头、文字、编号或标注。`

For every generated output that uses uploaded storyboard panels, add this rule once in the segment opening, adapting `P#-P#` to the exact panel range used by that segment: `首帧严格锁定上传分镜图P#起始格或对应视觉区域的构图、镜头高度、人物左右位置、主体比例、前景遮挡、背景街道纵深、景深和光影节奏；前0.5-1秒保持锁帧构图，再按照P#-P#的动作方向加入低机位广角近景、快速推近、甩镜、命中震动和反应镜头。`

Do not replace a storyboard panel with a generic shot label such as only `中景`, `低近景`, or `门口广角`. The shot must state the exact panel mimic target and the concrete composition elements being copied.

### Reference Scene Naturalization Rule

When the user provides an extra generated scene image, storyboard panel, or scene still as a reference for a Seedance shot, treat it as a first-frame lock or hard composition anchor, not as a literal flat picture to redraw. First lock the non-negotiable visual anchors, then translate the rest into natural motion.

Use this order:

1. **Lock the image anchors**: camera height, camera angle, shot size, foreground occlusion, character left/right/front/back positions, subject scale, door/window/wall/light positions, gaze axis, and depth direction.
2. **Bind anchors to story action**: explain why each person is in that position through motivated behavior, such as guarding, hiding, turning back, retreating to the door, listening to footsteps, shielding another character, or preparing to answer.
3. **Translate marks into physical behavior**: arrows, labels, colored dots, panel numbers, rough sketch symbols, and director notes become camera shift, body turn, eye-line change, hand movement, focus pull, light direction, or blocking motivation. Never generate the marks themselves.
4. **Keep natural micro-motion**: add restrained breathing, shoulder tension, delayed gaze shift, hand hesitation, cloth/armor follow-through, footsteps, door movement, and focus changes. The shot should feel like a living scene, not a frozen reproduction.
5. **Preserve continuity into/out of the reference**: define the previous shot's final position and the next shot's start position. If a new character enters, establish the doorway/axis before the entrance, then use a camera shift or focus pull instead of a spatial hard cut.
6. **End on a stable composition**: hold the final frame for 0.5-1 second on a clear readable arrangement, such as foreground occlusion -> middle-ground speaker -> background hidden listener.

Good wording pattern:

```text
严格参考上传场景图的构图和camera angle：镜头保持在牢房内侧低机位，前景遮挡形成窥视感，[图2]站在中景门边半挡住[图1]，[图1]位于后景低位，右侧高窗冷光斜射进牢房；不要生成图中的文字、箭头、编号或标注。把图中的方向提示翻译成[图2]听到脚步后扭头、肩膀收紧、身体自然挡住[图1]，镜头只做轻微低位呼吸感，结尾稳定在前景遮挡—中景[图2]—后景[图1]的三层纵深构图。
```

If the 分镜图 contains 12 panels, map prompt shots 1-12 to panel 1-12 unless the user explicitly asks to merge, omit, or reorder panels.

If a later segment uses panels 5-8 or 9-12, its opening constraint must name those panels and preserve their exact camera angles rather than saying only `参考上传分镜图`.

If `[图6]` contains storyboard markup, translate it silently into natural video language. Do not keep markup terms in the final video prompt:

- body/action marks -> character motion, body movement, hand path, turn, approach, retreat
- camera marks -> camera push, lateral slide, pan, follow, eye-line shift, focus change
- composition marks -> visual axis, relative position, gaze relationship, composition center
- light marks -> light source direction, local brightness change, shadow falloff, ambient change
- impact marks -> prop collision, emotional aftershock, tense pause, vibration after movement

Never write storyboard-markup phrases in the final prompt or ask the model to draw arrows/marks.


