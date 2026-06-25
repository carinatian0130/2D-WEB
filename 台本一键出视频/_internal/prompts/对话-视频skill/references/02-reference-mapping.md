# Reference Mapping And Character Locks

This file is loaded by SKILL.md only when its topic is relevant.

## Standing Reference Annotation

Apply this default mapping unless the user explicitly remaps it:

```text
[图1]=char:角色素材ID
[图2]=char:角色素材ID
[图3]=char:角色素材ID
[图4]=char:角色素材ID
[图5]=char:角色素材ID
[图6]=分镜图 / 分镜 / 首帧锚定图 / first-frame lock
```

Use this mapping as reference identity information, not as visible frame content.

Rules:

- Treat `[图1]-[图5]` as character appearance references.
- In the web pipeline, visible character and scene names in final prompts must be `char:id` / `scene:id`; do not output Chinese character names, Chinese scene names, file names, or `@char` / `@scene`.
- Treat `[图6]` as storyboard / 分镜图 / first-frame image-to-video lock.
- Use `[图6]` as the real first-frame reference image: the generated video's first frame must strictly match its current segment opening panel or corresponding visual region for composition, relative standing, shot size, camera angle, subject scale, foreground/midground/background depth, depth of field, light direction, prop interaction, gaze axis, and emotional state. Motion begins naturally from that locked first frame.
- Never use `[图6]` as a visible character, speaker, blocking participant, action subject, or object of dialogue.
- If the final prompt needs a reference sentence, write: `[图6]作为首帧锚定图 / image-to-video first-frame lock；视频第一帧严格匹配[图6]中当前片段起始格或对应视觉区域的构图、人物相对站位、镜头角度、主体比例、前中后景、景深和光影节奏，前0.5-1秒先保持锁帧构图，再从该首帧自然运动；不要生成图中文字、编号、箭头或标注。`
- If the user asks for pure prompt only, omit the reference annotation line and apply the mapping internally.


## Character Consistency and Anatomy

Keep character identity and anatomy consistent across every shot. Each visible character must keep the same reference-image identity, face, hairstyle, costume, body scale, silhouette, and relative height unless the user explicitly asks for a state change.

Always avoid:

- duplicate heads
- extra faces
- extra arms
- extra hands
- floating hands
- merged bodies
- malformed fingers
- repeated limbs
- sudden face, hairstyle, costume, or body-scale drift

When characters embrace, support, grab, stand close, or overlap, write hand ownership and final hand positions clearly:

`whose hand -> starting point -> contact point -> final resting point`

Prefer few clear contact points over vague tangled body overlap. Keep faces separated, shoulders readable, arms traceable from shoulder to hand, and every visible hand belonging to a specific `[图X]` or text-defined role.


