# Output Contract And Split Rules

This file is loaded by SKILL.md only when its topic is relevant.

## Core Output Rule

Output only usable prompt content unless the user explicitly asks for analysis. Do not output design reasoning, hidden calculations, internal checklists, or teaching notes.

When the user asks for only one part, such as “only before the first video split” or “only first part,” output only that requested segment and do not include later segments.


## Default Style and Opening Constraint

Use this baseline unless the user gives a different style:

```text
横版16:9，高质量3D anime open-world game cutscene，实时游戏引擎渲染，电影感光影，物理可信空间，角色轮廓清晰，眼神可读，表演克制但有情绪，前景/中景/背景层次明确。[图6]作为首帧锚定图 / image-to-video first-frame lock；视频第一帧严格匹配[图6]中当前片段起始格或对应视觉区域的构图、人物相对站位、镜头角度、主体比例、前中后景、景深和光影节奏，前0.5-1秒先保持锁帧构图，再从该首帧自然运动；不要生成图中文字、编号、箭头或标注。角色外观严格参考[图1]-[图5]，全段保持同一张脸、同一发型、同一服装、同一体型比例和同一轮廓；禁止多头、多脸、多手、多臂、漂浮手、融合身体、畸形手指或重复肢体。
```

Adapt the scene description, props, lighting, and environment to the script. Do not always force tavern details unless the script is an inn/tavern scene.


## Shot Format

Format every prompt with shot-specific paragraph lines. Each shot must start with:

`分镜N【X秒】`

Where `N` is sequential and `X` is an integer duration in seconds.

Pattern:

```text
分镜1【4秒】 中近景，主体动作与构图描述。角色说道：“原台词”（声线、语气、情绪、语速）。动作反应、道具位置、镜头运动、声音细节。结尾稳定在明确的手、道具、视线或情绪落点。
```

Requirements:

1. Start with shot size or camera placement after duration: `中近景，`, `中景，`, `高位斜角中远景，`, `低桌面侧拍，`.
2. Preserve exact dialogue inside quotation marks.
3. Add voice direction immediately after dialogue in Chinese parentheses.
4. Keep each shot as one coherent paragraph combining camera, blocking, action mechanics, dialogue, object sound, ambient sound, and stable ending.
5. Avoid checklist labels such as `主体：`, `构图：`, `动作：`, `台词：`, unless the user asks for breakdown.
6. For shots without dialogue, omit `台词：无。` unless clarity requires it; write non-speaking action naturally.
7. Avoid abrupt final cuts. Bridge group reactions with motivated camera paths and show previous action settling before changing emphasis.


## Hard Video Constraints

Apply to every output:

1. Keep each video segment at or under 15 seconds.
2. Keep each video-segment prompt under 2000 characters.
3. Split long scenes with an independent separator line exactly `===VIDEO_SPLIT===`.
4. Make every segment self-contained. Do not write “承接上一段”, “继续刚才”, “同上”, or “接前面”.
5. After every `===VIDEO_SPLIT===`, restart the next segment with a complete setting block. Do not rely on earlier segment context for style, location, reference-image mapping, storyboard first-frame lock mapping, character locks, text-defined roles, or face-blur constraints.
6. When the current dialogue-video task uses the market-street setting and `[图5]` storyboard first-frame lock mapping, repeat this structure at the start of every video split, replacing every asset with the web library token: `横版16:9，高质量3D anime open-world game cutscene，实时游戏引擎渲染，scene:场景素材ID，木栅栏、摊棚、碎箱、尘土和远处市门口岗位固定。角色外观只参考【图1】char:角色素材ID、【图2】char:角色素材ID、【图3】char:角色素材ID、【图4】char:角色素材ID；【图5】作为首帧锁帧参考图：视频第一帧严格匹配【图5】中当前片段起始格或对应视觉区域的构图、站位、镜头角度、主体比例、前中后景、景深和光影节奏；前0.5-1秒保持锁帧构图，再从该首帧自然运动；不生成图中文字、编号、箭头或标注。文本定义角色只在远处检查棚/市门口岗位出现，不加入角色锁；未出现角色不要加入角色锁或画面。忽略并不要还原参考图中被模糊处理的脸部细节。`
7. Do not generate visible subtitles, dialogue boxes, title cards, UI icons, explanatory signs, watermarks, logo text, readable marks, labels, arrows, panel numbers, or storyboard annotations.
8. Preserve original dialogue meaning, attitude, plot information, and emotional progression.
9. Preserve names, addresses, nicknames, pronouns, and second-person references inside quoted dialogue exactly as provided.
10. Outside quoted dialogue, do not use character names, nicknames, identity labels, gendered pronouns, or referential words such as “他”, “她”, “某人”, “少年”, “少女”. Refer to visible image-based people only as `[图X]`; use user-defined text-role labels only when unavoidable.
11. Blocking must describe only relative arrangement among visible people, not scene, prop, or environment positions.
12. Add concise biometrics for visible speaking or acting characters: age impression, face/eye/body impression, posture, physical tension, breathing state, and user-provided persona features.
13. Add promptable physical movement to every shot.
14. Preserve fixed prop positions, character spatial anchors, and location continuity.
15. Maintain character identity and anatomy consistency.
16. Include at least one restrained showcase shot per dialogue segment.


## Output Structure

Use this structure by default:

```text
【完整setting block：统一风格、画幅、画面限制；参考图规则；无可读文字规则；固定空间/光线/道具/角色锚点。每个===VIDEO_SPLIT===后的新段都重新写完整setting block。】

生成一个由【X】个分镜组成的视频

视频时长：【Y】秒

分镜1【X秒】 中近景，主体动作、构图、视线、手部起点、微动作、道具接触与最终位置。角色说道：“原台词”（声线、语气、情绪、语速）。镜头运动、物件声音、环境声、他人反应。结尾稳定在明确的手、道具、视线或情绪落点。

分镜2【X秒】 中景，主体动作、构图、视线、手部起点、微动作、道具接触与最终位置。角色说道：“原台词”（声线、语气、情绪、语速）。镜头运动、物件声音、环境声、他人反应。结尾稳定在明确的手、道具、视线或情绪落点。
```


## Handling Missing Information

Make reasonable cinematic assumptions when the task is still possible. Ask a question only when a required detail blocks generation, such as no dialogue/script/scene content, no usable character mapping for precise image-reference work, or an explicitly requested first/last-frame adaptation without the frame.


## Safety Boundaries

Refuse requests that require sexual content, illegal instructions, personal private data extraction, defamation/harassment, fake official documents, hate speech, violence promotion, catastrophic harm, or politically sensitive content. Offer a safe alternative when possible.

